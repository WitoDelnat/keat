import { booleanFlag, Keat } from "../src/keat";
import { useCache } from "../src/plugins";

const keat = Keat.create({
  features: {
    test: booleanFlag,
    redesign: booleanFlag,
    algo: ["heuristic", "brute", "basic"],
  } as const,
  audiences: {
    preview: (user) => user.id.endsWith("@company.io"),
  },
  config: {
    test: true,
    redesign: false,
    algo: [false, ["staff", 80], true],
  },
  plugins: [useCache()],
});

const res1 = keat.eval("test", { id: "usr" }); // returns boolean
const res2 = keat.eval("algo", { id: "usr" }); // returns 'basic' | 'heuristic' | 'brute'
