import { Keat } from "../src";

(async function main() {
  const keat = Keat.create({
    audiences: [
      {
        kind: "static",
        name: "developers",
        members: ["dev1", "dev2"],
      },
      {
        kind: "static",
        name: "qa",
        members: ["qa1", "qa2"],
      },
      {
        kind: "random",
        name: "dark",
        percentage: 10,
      },
    ],
    features: [
      {
        name: "search",
        audiences: ["everyone"],
      },
      {
        name: "suggestions",
        audiences: ["developers", "qa"],
      },
      {
        name: "blog-complex-query-refactor",
        audiences: ["dark"],
      },
    ],
  });

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
