import { Plugin, takeStrings } from "../core";

export const schedule = (): Plugin => {
  return {
    onEval({ variates, rules }, { setResult }) {
      const index = rules.findIndex((rule) =>
        takeStrings(rule)
          .map((s) => Date.parse(s))
          .filter((d) => !isNaN(d))
          .some((d) => d < Date.now())
      );

      if (index !== -1) setResult(variates[index]);
    },
  };
};
