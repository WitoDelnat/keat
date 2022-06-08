import { Plugin, takeStrings, User } from "../core";

type AudiencesPluginOptions = Record<string, AudienceFn>;
type AudienceFn = (user?: User) => boolean | undefined;

export const audiences = (options: AudiencesPluginOptions): Plugin => {
  const audiences = options;

  return {
    onEval({ variates, rules, user }, { setResult }) {
      if (!user) return;

      const index = rules.findIndex((rule) =>
        takeStrings(rule).some((audience) => {
          try {
            return audiences[audience]?.(user);
          } catch {
            return false;
          }
        })
      );

      if (index !== -1) setResult(variates[index]);
    },
  };
};
