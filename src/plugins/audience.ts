import { Plugin, takeStrings, User } from "../core";

type AudienceFn = (user: User) => boolean | undefined;

export const audience = (name: string, fn: AudienceFn): Plugin => {
  return {
    onEval({ variates, rules, user }, { setResult }) {
      if (!user) return;

      const index = rules.findIndex((rule) =>
        takeStrings(rule).some((r) => {
          if (r !== name) return false;
          try {
            return fn(user);
          } catch {
            return false;
          }
        })
      );

      if (index !== -1) setResult(variates[index]);
    },
  };
};
