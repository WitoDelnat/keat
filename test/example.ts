import { booleanFlag, Keat } from "../src/keat";
import { useCache } from "../src/plugins";

const keat = Keat.create({
  features: {
    test: booleanFlag,
    redesign: booleanFlag,
    algo: ["heuristic", "brute", "basic"],
  } as const,
  audiences: {
    preview: (user) => user.sub.endsWith("@company.io"),
  },
  config: {
    test: true,
    redesign: false,
    algo: [false, ["staff", 80], true],
  },
  plugins: [useCache()],
});

const res1 = keat.eval("test", { sub: "usr" }); // returns boolean
const res2 = keat.eval("algo", { sub: "usr" }); // returns 'basic' | 'heuristic' | 'brute'
