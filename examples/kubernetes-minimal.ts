import { Keat } from "../src";

(async function main() {
  const keat = await Keat.fromKubernetes();

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
