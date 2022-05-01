import { isString, isNumber, isBoolean, last } from "lodash";
import type {
  BiVariateRule,
  MultiVariateRule,
  NormalizedRule,
  RolloutRule,
  Rule,
  TargetRule,
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

export function preprocessRule(rule: NormalizedRule[]): {
  targetPhase: TargetRule;
  rolloutPhase: RolloutRule;
} {
  const targetPhase = preprocessTargetPhase(rule);
  const rolloutPhase = preprocessRolloutPhase(rule);
  return { targetPhase, rolloutPhase };
}

function preprocessTargetPhase(rule: NormalizedRule[]): TargetRule {
  const targetRule = [...rule].map((p) => {
    if (isBoolean(p)) return p;
    const arr = p.filter(isString);
    return arr.length === 0 ? false : arr;
  });
  const skipTargetPhase = targetRule.every((p) => p === false);
  return skipTargetPhase ? false : targetRule;
}

function preprocessRolloutPhase(rule: NormalizedRule[]): RolloutRule {
  const rolloutRule = [...rule].map((p) => {
    if (isBoolean(p)) return p;
    const arr = p.filter(isNumber);
    return last(arr) ?? false;
  });
  const skipRolloutPhase = rolloutRule.every((p) => p === false);
  return skipRolloutPhase ? false : rolloutRule;
}
