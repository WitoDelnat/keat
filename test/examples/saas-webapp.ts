import { booleanFlag, Keat } from "../../src/core";
import { useAudiences, useRemoteConfig, useRollouts } from "../../src/plugins";

const keat = Keat.create({
  features: {
    test: booleanFlag,
    redesign: booleanFlag,
    sortAlgorithm: ["quicksort", "heapsort"],
  } as const,
  plugins: [
    useRemoteConfig("https://example.io/config"),
    useAudiences({
      staff: (user) => user.email?.endsWith("example.io"),
      preview: (user) => user.preview,
    }),
    useRollouts(),
  ],
  config: {
    redesign: ["staff", 5], // enabled for staff and 5% of users.
    sortAlgorithm: ["staff", "preview", 5], // 'quicksort' for staff, preview and 5% of users - otherwise 'heapsort'.
  },
});

// User is access token with custom `preview` claim.
const user = { sub: "abc", email: "dev@example.io", preview: true };
keat.eval("sortAlgorithm", user);
