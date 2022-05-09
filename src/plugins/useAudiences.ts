import { isBoolean, isString, mapValues } from "lodash";
import { NormalizedRule, Plugin, User } from "../core";

type AudiencesPluginOptions = Record<string, AudienceFn>;
type AudienceFn = (user: User) => boolean;

export const useAudiences = (options: AudiencesPluginOptions): Plugin => {
  const audiences = options;
  let features: Record<string, unknown[]>;
  let audienceRules: Record<string, false | Array<string[] | boolean>>;

  return {
    onPluginInit({ features }) {
      features = features;
    },
    onConfigChange(config) {
      audienceRules = mapValues(config, preprocessAudiences);
    },
    onEval({ user, feature, result }, { setResult }) {
      if (result || !user) return;
      const variates = features[feature];
      const rule = audienceRules[feature];
      if (!variates || !rule) return;

      for (const [index, value] of rule.entries()) {
        if (value === true) return setResult(variates[index]);
        if (value === false) continue;
        const match = value.some((a) => audiences[a]?.(user));
        if (match) return setResult(variates[index]);
      }
    },
  };
};

function preprocessAudiences(rule: NormalizedRule[]) {
  const audienceRule = rule.map((p) => {
    if (isBoolean(p)) return p;
    const arr = p.filter(isString);
    return arr.length === 0 ? false : arr;
  });
  const skipAudiencePhase = audienceRule.every((p) => p === false);
  return skipAudiencePhase ? false : audienceRule;
}
