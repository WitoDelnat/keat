import { Keat } from "../src";

(async function main() {
  const keat = Keat.fromKubernetes();
  await keat.ready;

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
