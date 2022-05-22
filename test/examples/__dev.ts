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

(async function main() {
  const user = { email: "wito.delnat@gmail.com", id: "test" };
  const res1 = keat.variation("test", user); // returns boolean
  const res2 = keat.variation("algo"); // returns 'basic' | 'heuristic' | 'brute'
  console.log("test", res1, res2);

  await keat.ready("fallback");
  const res3 = keat.variation("algo", undefined, "fallback");
  console.log("testb", res3);
})();
