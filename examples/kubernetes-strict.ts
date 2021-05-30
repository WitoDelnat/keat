import { Keat } from "../src";

(async function main() {
  const keat = Keat.fromKubernetes({
    logger: true,
    strict: ["search"],
  });
  await keat.ready;

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
