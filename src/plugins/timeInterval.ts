import { Plugin, takeStrings } from "../core";

export const timeInterval = (): Plugin => {
  return {
    onEval({ variates, rules }, { setResult }) {
      const index = rules.findIndex((rule) =>
        takeStrings(rule).some((s) => {
          const split = s.split("/");
          if (split.length !== 2) return false;
          const now = Date.now();
          const start = Date.parse(split[0]);
          const end = Date.parse(split[1]);
          const isStart = !isNaN(start);
          const isEnd = !isNaN(end);

          if (isStart && isEnd) {
            // ISO-8601 time intervals with start and end.
            return start < now && now < end;
          } else {
            return false;
          }
        })
      );

      if (index !== -1) setResult(variates[index]);
    },
  };
};
