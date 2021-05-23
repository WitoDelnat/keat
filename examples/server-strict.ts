import { Keat } from "../src";

(async function main() {
  const keat = await Keat.fromKeatServer({
    origin: "http://localhost:8080",
    strict: ["search"],
  });

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
