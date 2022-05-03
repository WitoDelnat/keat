import { isBoolean, isNumber, isString, last } from "lodash";
import type {
  BiVariateRule,
  MultiVariateRule,
  NormalizedRule,
  PhasedConfig,
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

export function preprocessRule(rule: NormalizedRule[]): PhasedConfig {
  const audience = preprocessAudiencePhase(rule);
  const rollout = preprocessRolloutPhase(rule);
  const fallback = preprocessFallbackPhase(rule);
  return { audience, rollout, fallback };
}

function preprocessAudiencePhase(rule: NormalizedRule[]) {
  const audienceRule = rule.map((p) => {
    if (isBoolean(p)) return p;
    const arr = p.filter(isString);
    return arr.length === 0 ? false : arr;
  });
  const skipAudiencePhase = audienceRule.every((p) => p === false);
  return skipAudiencePhase ? false : audienceRule;
}

function preprocessRolloutPhase(rule: NormalizedRule[]) {
  const rolloutRule = rule.map((p) => {
    if (isBoolean(p)) return p;
    const arr = p.filter(isNumber);
    return last(arr) ?? false;
  });
  const skipRolloutPhase = rolloutRule.every((p) => p === false);
  return skipRolloutPhase ? false : rolloutRule;
}

function preprocessFallbackPhase(rule: NormalizedRule[]) {
  const index = rule.findIndex((v) => v === true);
  return index === -1 ? rule.length - 1 : index;
}
