import { Plugin, User } from "../core";

type AudiencesPluginOptions = Record<string, AudienceFn>;
type AudienceFn = (user?: User) => boolean | undefined;

export const audiences = (options: AudiencesPluginOptions): Plugin => {
  const audiences = options;
  let featureMap: Record<string, unknown[]> = {};

  return {
    onPluginInit({ features }) {
      featureMap = features;
    },
    onEval({ variates, rule, user }, { setResult }) {
      if (!user) return;

      for (const [index, value] of rule.entries()) {
        if (typeof value === "boolean") continue;
        const match = value.some((a) => {
          try {
            return audiences[a]?.(user);
          } catch {
            return false;
          }
        });
        if (match) return setResult(variates[index]);
      }
    },
  };
};
