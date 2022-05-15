import { booleanFlag, Keat } from "../../src/core";
import {
  useAudiences,
  useCache,
  useRemoteConfig,
  useRollouts,
} from "../../src/plugins";

const keat = Keat.create({
  features: {
    test: booleanFlag,
    redesign: booleanFlag,
    algo: ["heuristic", "brute", "basic"],
  } as const,
  config: {
    test: true,
    algo: [15, ["staff", 20], true],
  },
  plugins: [
    useRemoteConfig("https://example.com/config"),
    useCache(),
    useAudiences({
      staff: (user) => user.company.endsWith("@company.io"),
    }),
    useRollouts(),
  ],
});

const res1 = keat.eval("test", { email: "wito.delnat@gmail.com", id: "test" }); // returns boolean
const res2 = keat.eval("algo"); // returns 'basic' | 'heuristic' | 'brute'
