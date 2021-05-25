import { Keat } from "../src";

(async function main() {
  const keat = Keat.create({
    features: [
      { name: "new-ui" },
      { audiences: ["everyone"], name: "search" },
      { audiences: ["everyone"], name: "suggestions", enabled: false },
    ],
  });

  if (keat.isEnabled("new-ui")) {
    console.log("✅ new-ui is enabled");
  }
})();
