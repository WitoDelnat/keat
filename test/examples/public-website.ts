import { keatCore } from "../../src/core";
import { anonymous, audiences, rollouts } from "../../src/plugins";

const { variation } = keatCore({
  features: {
    advancedSearch: { OR: [15, "preview"] },
    design: {
      variates: ["halloween", "default"],
      when: ["halloweenPeriod", "preview"],
    },
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
});

// User is automatically added and persisted across session.
variation("advancedSearch");
