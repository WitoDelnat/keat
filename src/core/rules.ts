import type {
  BiVariateRule,
  Elem,
  MultiVariateRule,
  NormalizedElem,
  NormalizedRule,
} from "./types";

export function normalize(
  rule: BiVariateRule | MultiVariateRule | undefined,
  isMultiVariate: boolean
): NormalizedRule | undefined {
  try {
    if (!rule) return undefined;
    // Assume user configured correctly.
    // Schema validation is difficult due to overlapping cases.
    // example: ["staff", 50]
    return isMultiVariate
      ? (rule as MultiVariateRule).map(normalizeElem)
      : [normalizeElem(rule as BiVariateRule)];
  } catch (err) {
    console.warn("[keat] misconfigured rule", rule, isMultiVariate);
    return [];
  }
}

function normalizeElem(elem: Elem): NormalizedElem {
  if (typeof elem === "string" || typeof elem === "number") return [elem];
  return elem;
}
