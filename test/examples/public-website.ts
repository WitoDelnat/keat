import { booleanFlag, keat } from "../../src/core";
import { anonymous, audiences, rollouts } from "../../src/plugins";

const { variation } = keat({
  features: {
    advancedSearch: booleanFlag,
    design: ["halloween", "default"],
  } as const,
  plugins: [
    anonymous({ persist: true }),
    audiences({
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
    rollouts(),
  ],
  config: {
    advancedSearch: [15, "preview"], // enabled for preview and 15% of users.
    design: ["halloweenPeriod", "preview"], // enabled during Halloween and for preview.
  },
});

// User is automatically added and persisted across session.
variation("advancedSearch");
