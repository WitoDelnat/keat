import { keat } from "../../src";
import { audiences, rollouts } from "../../src/plugins";

export const { variation } = keat({
  features: {
    sortAlgorithm: ["quicksort", "insertionSort", "heapsort"],
    example: [1, 2, 3, 4, 5],
  } as const,
  plugins: [
    rollouts(),
    audiences({
      /* .. */
    }),
  ],
  config: {
    sortAlgorithm: [["staff", 5], 20],
    example: ["staff", ["preview", 5], false, 20],
  },
});
