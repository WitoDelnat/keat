import { Client } from "./interface";
import { Labels, Definitions, definitionsSchema } from "../model/definitions";
import { URL, URLSearchParams } from "url";
import fetch from "node-fetch";

export class KeatClient implements Client {
  constructor(
    private origin: string = "http://keat-server.keat.svc.cluster.local"
  ) {}

  async getDefinitions(labels?: Labels): Promise<Definitions> {
    const url = new URL("/v1/definitions", this.origin);
    url.search = new URLSearchParams(labels).toString();

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }

    const body = await response.json();
    const definitions = definitionsSchema.parse(body);

    return definitions;
  }
}
