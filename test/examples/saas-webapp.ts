import { booleanFlag, keat } from "../../src/core";
import { audiences, remoteConfig, rollouts } from "../../src/plugins";

const { variation } = keat({
  features: {
    test: booleanFlag,
    redesign: booleanFlag,
    sortAlgorithm: ["quicksort", "heapsort"],
  } as const,
  plugins: [
    remoteConfig("https://example.io/config"),
    audiences({
      staff: (user) => user.email?.endsWith("example.io"),
      preview: (user) => user.preview,
    }),
    rollouts(),
  ],
  config: {
    redesign: ["staff", 5], // enabled for staff and 5% of users.
    sortAlgorithm: ["staff", "preview", 5], // 'quicksort' for staff, preview and 5% of users - otherwise 'heapsort'.
  },
});

// User is access token with custom `preview` claim.
const user = { sub: "abc", email: "dev@example.io", preview: true };
variation("sortAlgorithm", user);
