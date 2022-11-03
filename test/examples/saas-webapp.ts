import { keatCore } from "../../src/core";
import {
  audience,
  keatRelease,
  remoteConfig,
  rollouts,
} from "../../src/plugins";

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
    audience("staff", (user) => user.email?.endsWith("example.io")),
    audience("preview", (user) => user.preview),
    keatRelease("test"),
    rollouts(),
  ],
});

// User is access token with custom `preview` claim.
const user = { sub: "abc", email: "dev@example.io", preview: true };
variation("sortAlgorithm", user);
