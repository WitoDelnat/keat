import { Definitions } from "../model/definitions";
import { LabelSelectors } from "../model/labels";

export interface Client {
  getDefinitions(labels?: LabelSelectors): Promise<Definitions>;
}
