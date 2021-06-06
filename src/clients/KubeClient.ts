import { readFileSync } from "fs";
import https, { Agent } from "https";
import fetch from "node-fetch";
import { URL } from "url";
import * as z from "zod";
import {
  AudienceDefinition,
  Definitions,
  FeatureDefinition,
} from "../model/definitions";
import { encodeLabelSelectors, LabelSelectors } from "../model/labels";
import { Client } from "./interface";

const DEFAULT_ORIGIN = "https://kubernetes.default.svc";
const DEFAULT_PATH = "/var/run/secrets/kubernetes.io/serviceaccount";

type KubeInit = {
  origin?: string;
  namespace?: string;
  token: string;
  agent?: Agent;
};

export class KubeClient implements Client {
  static fromConfig(path: string = DEFAULT_PATH) {
    const namespace = readFileSync(`${path}/namespace`, "utf-8");
    const token = readFileSync(`${path}/token`, "utf-8");
    const cert = readFileSync(`${path}/ca.crt`, "utf-8");
    const agent = new https.Agent({ cert, rejectUnauthorized: false });
    return new KubeClient({ namespace, token, agent });
  }

  private origin: string;
  private agent: Agent | undefined;
  private token: string;
  private namespace: string;

  constructor({ namespace, origin, token, agent }: KubeInit) {
    this.origin = origin ?? DEFAULT_ORIGIN;
    this.namespace = namespace ?? "default";
    this.token = token;
    this.agent = agent;
  }

  async getDefinitions(labels?: LabelSelectors): Promise<Definitions> {
    const [audiences, features] = await Promise.all([
      this.getAudiences(),
      this.getFeatures(labels),
    ]);
    return { audiences, features };
  }

  private async getAudiences(): Promise<AudienceDefinition[]> {
    const response = await this.fetch("keat.io", "audiences", "v1alpha1");
    const audienceList = AudienceListResourceSchema.parse(response);
    const audiences = audienceList.items.map(toAudienceDefinition);
    return audiences;
  }

  private async getFeatures(
    labels?: LabelSelectors
  ): Promise<FeatureDefinition[]> {
    const response = await this.fetch(
      "keat.io",
      "features",
      "v1alpha1",
      labels
    );
    const featureFlagList = FeatureListResourceSchema.parse(response);
    const features = featureFlagList.items.map(toFeatureDefinition);
    return features;
  }

  private async fetch(
    audience: string,
    plural: string,
    version: string,
    labels?: LabelSelectors
  ) {
    const relativeUrl = `/apis/${audience}/${version}/namespaces/${this.namespace}/${plural}`;
    const url = new URL(relativeUrl, this.origin);

    if (labels) {
      const labelSelector = encodeLabelSelectors(labels);
      url.searchParams.append("labelSelector", labelSelector);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      agent: this.agent,
    });

    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }

    const content = await response.json();
    return content;
  }
}

export type FeatureResource = z.infer<typeof FeatureResourceSchema>;
const FeatureResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z
    .object({
      name: z.string(),
      labels: z.record(z.string()).optional(),
    })
    .nonstrict(),
  spec: z.object({
    enabled: z.boolean(),
    audiences: z.array(z.string()).optional(),
  }),
});

export type FeatureListResource = z.infer<typeof FeatureListResourceSchema>;
export const FeatureListResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.any(),
  items: z.array(FeatureResourceSchema),
});

export type AudienceResource = z.infer<typeof AudienceResourceSchema>;
export const AudienceResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z
    .object({
      name: z.string(),
      labels: z.record(z.string()).optional(),
    })
    .nonstrict(),
  spec: z.union([
    z.object({
      kind: z.literal("static"),
      members: z.array(z.string()),
      key: z.string().optional(),
    }),
    z.object({
      kind: z.literal("random"),
      percentage: z.number(),
    }),
    z.object({
      kind: z.literal("sticky"),
      percentage: z.number(),
      key: z.string().optional(),
    }),
  ]),
});

export type AudienceListResource = z.infer<typeof AudienceListResourceSchema>;
export const AudienceListResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.any(),
  items: z.array(AudienceResourceSchema),
});

function toAudienceDefinition(audience: AudienceResource): AudienceDefinition {
  switch (audience.spec.kind) {
    case "static": {
      return {
        kind: "static",
        name: audience.metadata.name,
        members: audience.spec.members,
        key: audience.spec.key,
      };
    }
    case "random": {
      return {
        kind: "random",
        name: audience.metadata.name,
        percentage: audience.spec.percentage,
      };
    }
    case "sticky": {
      return {
        kind: "sticky",
        name: audience.metadata.name,
        percentage: audience.spec.percentage,
        key: audience.spec.key,
      };
    }
  }
}

function toFeatureDefinition(feature: FeatureResource): FeatureDefinition {
  return {
    name: feature.metadata.name,
    labels: feature.metadata.labels,
    enabled: feature.spec.enabled,
    audiences: feature.spec.audiences,
  };
}
