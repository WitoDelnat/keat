import { Keat } from "../src";

(async function main() {
  const keat = await Keat.fromKubernetes({
    labels: {
      app: "blog",
      env: "prod",
    },
  });

  if (keat.isEnabled("search")) {
    console.log("✅ search is enabled");
  }
})();
