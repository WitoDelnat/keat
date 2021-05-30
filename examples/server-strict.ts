import { Keat } from "../src";

(async function main() {
  const keat = Keat.fromKeatServer({
    origin: "http://localhost:8080",
    strict: ["search"],
  });
  await keat.ready;

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
