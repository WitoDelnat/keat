import { isNumber, isString } from "lodash";
import type {
  BiVariateRule,
  MultiVariateRule,
  NormalizedRule,
  Rule,
} from "./types";

export function normalizeVariateRule(
  rule: BiVariateRule | MultiVariateRule,
  isMultiVariate: boolean
): NormalizedRule[] {
  try {
    // Assume user configured correctly.
    // Schema validation is difficult due to overlapping cases.
    // example: ["staff", 50]
    return isMultiVariate
      ? (rule as MultiVariateRule).map(normalizeRule)
      : [normalizeRule(rule as BiVariateRule)];
  } catch (err) {
    console.warn("[keat] misconfigured rule", rule, isMultiVariate);
    return [];
  }
}

function normalizeRule(rule: Rule): NormalizedRule {
  if (isString(rule) || isNumber(rule)) return [rule];
  return rule;
}
