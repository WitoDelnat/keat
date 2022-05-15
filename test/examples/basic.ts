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

keat.eval("test"); // returns `true`.
keat.eval("redesign"); // returns `false` as fallback.
keat.eval("sortAlgorithm"); // returns 'quicksort'
