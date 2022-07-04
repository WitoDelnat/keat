import { keatCore } from "../../src/core";
import { anonymous, audience, queryParam, rollouts } from "../../src/plugins";

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
    queryParam("preview"),
    audience("halloweenPeriod", () => {
      const now = Date.now();
      const start = new Date(2022, 10, 15).getTime();
      const end = new Date(2022, 11, 2).getTime();
      return start < now && now < end;
    }),
    rollouts(),
  ],
});

// User is automatically added and persisted across session.
variation("advancedSearch");
