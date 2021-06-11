import fetch from "node-fetch";
import { URL } from "url";
import {
  LabelSelectors,
  Definitions,
  encodeLabelSelectors,
  definitionsSchema,
} from "../keat-core";

export class KeatClient {
  constructor(
    private origin: string = "http://keat-server.keat.svc.cluster.local"
  ) {}

  async getDefinitions(labels?: LabelSelectors): Promise<Definitions> {
    const url = new URL("/v1/definitions", this.origin);

    if (labels) {
      const labelSelector = encodeLabelSelectors(labels);
      url.searchParams.append("labelSelector", labelSelector);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }

    const body = await response.json();
    const definitions = definitionsSchema.parse(body);

    return definitions;
  }
}
