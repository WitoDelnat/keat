import { readFile } from "fs/promises";
import https, { Agent } from "https";
import fetch from "node-fetch";
import * as z from "zod";
import {
  Definitions,
  FeatureDefinition,
  AudienceDefinition,
} from "../model/definitions";
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
  static async fromConfig(path: string = DEFAULT_PATH) {
    const namespace = await readFile(`${path}/namespace`, "utf-8");
    const token = await readFile(`${path}/token`, "utf-8");
    const cert = await readFile(`${path}/ca.crt`, "utf-8");
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

  async getDefinitions(): Promise<Definitions> {
    const [audiences, features] = await Promise.all([
      this.getAudiences(),
      this.getFeatures(),
    ]);
    return { audiences, features };
  }

  private async getAudiences(): Promise<AudienceDefinition[]> {
    const response = await this.fetch("keat.io", "audiences", "v1alpha1");
    const audienceList = AudienceListResourceSchema.parse(response);
    const audiences = audienceList.items.map(toAudienceDefinition);
    return audiences;
  }

  private async getFeatures(): Promise<FeatureDefinition[]> {
    const response = await this.fetch("keat.io", "features", "v1alpha1");
    const featureFlagList = FeatureListResourceSchema.parse(response);
    const features = featureFlagList.items.map(toFeatureDefinition);
    return features;
  }

  private async fetch(audience: string, plural: string, version: string) {
    const response = await fetch(
      `${this.origin}/apis/${audience}/${version}/namespaces/${this.namespace}/${plural}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        agent: this.agent,
      }
    );

    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }

    const content = await response.json();
    return content;
  }
}

type FeatureResource = z.infer<typeof FeatureResourceSchema>;
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

const FeatureListResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.any(),
  items: z.array(FeatureResourceSchema),
});

type AudienceResource = z.infer<typeof AudienceResourceSchema>;
const AudienceResourceSchema = z.object({
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
    }),
    z.object({
      kind: z.literal("random"),
      percentage: z.number(),
    }),
  ]),
});

const AudienceListResourceSchema = z.object({
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
      };
    }
    case "random": {
      return {
        kind: "random",
        name: audience.metadata.name,
        percentage: audience.spec.percentage,
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
