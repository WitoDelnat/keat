import { ExtractFeatures, keatCore } from "../../src";

type Feature = ExtractFeatures<typeof keat>;

const keat = keatCore({
  features: {
    test: true,
    redesign: true,
    sortAlgorithm: {
      variates: ["quicksort", "heapsort"],
      when: true,
    },
  } as const,
});

keat.variation("test"); // returns `true`.
keat.variation("redesign"); // returns `false` as fallback.
keat.variation("sortAlgorithm"); // returns 'quicksort'
