import { Keat } from "../src";

(async function main() {
  const keat = await Keat.fromKeatServer();

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
