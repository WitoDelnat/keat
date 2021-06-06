import { toPairs } from "lodash";

export type Labels = Record<string, string>;
export type LabelSelectors = Record<string, string>;

export function encodeLabelSelectors(selector: LabelSelectors): string {
  return toPairs(selector)
    .map((pair) => pair.join("="))
    .map((label) => encodeURI(label))
    .join(",");
}
