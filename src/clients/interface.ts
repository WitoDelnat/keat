import { Definitions, Labels } from "../model/definitions";

export interface Client {
  getDefinitions(labels?: Labels): Promise<Definitions>;
}
