import { useReducer } from "react";
import { keatCore } from "../../src";
import { audience, rollouts } from "../../src/plugins";

export const { variation } = keatCore({
  features: {
    sortAlgorithm: {
      variates: ["quicksort", "insertionSort", "heapsort"],
      when: [{ OR: ["staff", 5] }, 20],
    },
    example: {
      variates: [1, 2, 3, 4, 5],
      when: ["staff", { OR: ["preview", 5] }, false, 20],
    },
  } as const,
  plugins: [rollouts(), audience("test", (user) => user.id === 1)],
});
