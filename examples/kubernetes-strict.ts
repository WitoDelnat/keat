import { Keat } from "../src";

(async function main() {
  const keat = await Keat.fromKubernetes({
    logger: true,
    strict: ["search"],
  });

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
