import { booleanFlag, keat } from "../../src";

const { variation } = keat({
  features: {
    test: booleanFlag,
    redesign: booleanFlag,
    sortAlgorithm: ["quicksort", "heapsort"],
  } as const,
  config: {
    test: true,
    sortAlgorithm: true,
  },
});

variation("test"); // returns `true`.
variation("redesign"); // returns `false` as fallback.
variation("sortAlgorithm"); // returns 'quicksort'
