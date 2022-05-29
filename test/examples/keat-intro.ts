import {
  keatReact,
  booleanFlag,
  audiences,
  remoteConfig,
  rollouts,
} from "../../src";

const { useKeat, FeatureBoundary } = keatReact({
  plugins: [
    remoteConfig("https://example.io/config", { interval: 300 }),
    audiences({
      staff: (user) => user.email?.endsWith("example.io"),
    }),
    rollouts(),
  ],
  features: {
    recommendations: booleanFlag,
    sortAlgorithm: ["quicksort", "heapsort", "insertionSort"],
  },
  config: {
    recommendations: true,
    sortAlgorithm: [["staff", 20], 50, 30],
  },
});
