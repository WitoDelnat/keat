import { Keat } from "../src";
import definitions from "./definitions.json";

(async function main() {
  const keat = Keat.fromDefinitions({ definitions });

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
