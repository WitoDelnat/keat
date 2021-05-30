import { Keat } from "../src";

(async function main() {
  const keat = Keat.fromKeatServer();
  await keat.ready;

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
