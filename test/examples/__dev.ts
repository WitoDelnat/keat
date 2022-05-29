import { booleanFlag, keat } from "../../src";
import { audiences, cache, remoteConfig, rollouts } from "../../src/plugins";

const { variation, ready } = keat({
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
    remoteConfig("https://example.com/config"),
    cache(),
    audiences({
      staff: (user) => user.company.endsWith("@company.io"),
    }),
    rollouts(),
  ],
});

(async function main() {
  const user = { email: "wito.delnat@gmail.com", id: "test" };
  const res1 = variation("test", user); // returns boolean
  const res2 = variation("algo"); // returns 'basic' | 'heuristic' | 'brute'
  console.log("test", res1, res2);

  await ready("fallback");
  const res3 = variation("algo", undefined, "fallback");
  console.log("testb", res3);
})();
