import { keatCore } from "../../src";
import { audiences, rollouts } from "../../src/plugins";

const { variation, ready } = keatCore({
  plugins: [
    audiences({
      staff: (user) => user.company.endsWith("@company.io"),
    }),
    rollouts(),
  ],
  features: {
    bar: "staff",
    test: {
      when: true,
    },
    redesign: {
      when: { OR: ["staff", 25] },
    },
    foo: {
      variates: ["a", "b"],
      when: { OR: [1, 2] },
    },
    algo: {
      variates: ["heuristic", "brute", "basic"],
      when: [false, true, false],
    },
  },
});

(async function main() {
  const bar = variation("bar");
  const user = { email: "wito.delnat@gmail.com", id: "test" };
  const res1 = variation("test", user); // returns boolean
  const res2 = variation("algo"); // returns 'basic' | 'heuristic' | 'brute'
  console.log("test", res1, res2);

  await ready("fallback");
  const res3 = variation("algo", undefined, "fallback");
  console.log("testb", res3);
})();
