import { readFileSync } from "fs";
import https, { Agent } from "https";
import fetch from "node-fetch";
import { URL } from "url";
import {
  AudienceDefinition,
  Definitions,
  encodeLabelSelectors,
  FeatureDefinition,
  LabelSelectors,
} from "../keat-core";
import {
  AudienceListResourceSchema,
  toAudienceDefinition,
} from "./audienceResource";
import {
  FeatureListResourceSchema,
  toFeatureDefinition,
} from "./featureResource";

const DEFAULT_ORIGIN = "https://kubernetes.default.svc";
const DEFAULT_PATH = "/var/run/secrets/kubernetes.io/serviceaccount";

type KubeInit = {
  origin?: string;
  namespace?: string;
  token: string;
  agent?: Agent;
};

export class KubeClient {
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
