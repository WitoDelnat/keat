import { Keat } from "../../src/core";
import { useAudiences, useRollouts } from "../../src/plugins";

const keat = Keat.create({
  features: {
    sortAlgorithm: ["quicksort", "insertionSort", "heapsort"],
    example: [1, 2, 3, 4, 5],
  } as const,
  plugins: [
    useRollouts(),
    useAudiences({
      /* .. */
    }),
  ],
  config: {
    sortAlgorithm: [["staff", 5], 20],
    example: ["staff", ["preview", 5], false, 20],
  },
});
