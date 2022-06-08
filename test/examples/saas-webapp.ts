import { keatCore } from "../../src/core";
import { audiences, remoteConfig, rollouts } from "../../src/plugins";

const { variation } = keatCore({
  features: {
    test: true,
    redesign: { OR: ["staff", 5] },
    sortAlgorithm: {
      variates: ["quicksort", "heapsort"],
      when: ["staff", "preview", 5],
    },
  } as const,
  plugins: [
    remoteConfig("https://example.io/config"),
    audiences({
      staff: (user) => user.email?.endsWith("example.io"),
      preview: (user) => user.preview,
    }),
    rollouts(),
  ],
});

// User is access token with custom `preview` claim.
const user = { sub: "abc", email: "dev@example.io", preview: true };
variation("sortAlgorithm", user);
