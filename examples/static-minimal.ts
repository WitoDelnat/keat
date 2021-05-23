import { Keat } from "../src";

(async function main() {
  const keat = Keat.create({
    features: [
      { audiences: ["everyone"], name: "search" },
      { audiences: ["everyone"], name: "suggestions", enabled: false },
    ],
  });

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
