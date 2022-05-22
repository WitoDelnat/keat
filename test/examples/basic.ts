import { booleanFlag, Keat } from "../../src/core";

const keat = Keat.create({
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

keat.variation("test"); // returns `true`.
keat.variation("redesign"); // returns `false` as fallback.
keat.variation("sortAlgorithm"); // returns 'quicksort'
