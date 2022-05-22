import { booleanFlag, Keat } from "../../src/core";
import { useAnonymous, useAudiences, useRollouts } from "../../src/plugins";

const keat = Keat.create({
  features: {
    advancedSearch: booleanFlag,
    design: ["halloween", "default"],
  } as const,
  plugins: [
    useAnonymous({ persist: true }),
    useAudiences({
      preview: () => {
        const queryString = window.location.search;
        const params = new URLSearchParams(queryString);
        return params.has("preview");
      },
      halloweenPeriod: () => {
        const now = Date.now();
        const start = new Date(2022, 10, 15).getTime();
        const end = new Date(2022, 11, 2).getTime();
        return start < now && now < end;
      },
    }),
    useRollouts(),
  ],
  config: {
    advancedSearch: [15, "preview"], // enabled for preview and 15% of users.
    design: ["halloweenPeriod", "preview"], // enabled during Halloween and for preview.
  },
});

// User is automatically added and persisted across session.
keat.variation("advancedSearch");
