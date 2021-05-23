import { Keat } from "../src";

(async function main() {
  const keat = Keat.create({
    audiences: [
      {
        kind: "static",
        name: "developers",
        members: ["dev1", "dev2"],
      },
    ],
    features: [
      {
        name: "search",
        enabled: process.env.SEARCH_ENABLED === "true",
        audiences: ["everyone"],
      },
      {
        name: "suggestions",
        audiences: ["developers"],
      },
    ],
  });

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
