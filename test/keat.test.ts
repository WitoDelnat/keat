import { describe, expect, it } from "vitest";
import { Keat } from "../src/core";
import { useAudiences, useRollouts } from "../src/plugins";

describe("keat", () => {
  it("basic scenario", async () => {
    const keat = Keat.create({
      features: {
        feature1: [true, false],
        feature2: ["advanced", "experimental", "basic"],
      } as const,
      config: {
        feature1: ["staff", 30], // True for staff and 30%.
        feature2: [30, "staff"], // Experimental for staff and advanced for 30%.
      },
      plugins: [
        useAudiences({
          preview: (user) => ["p"].includes(user.id),
          staff: (user) => ["s"].includes(user.id),
        }),
        useRollouts({ hash: () => 25 }),
      ],
    });
    await keat.ready;

    const subP1 = keat.variation("feature1", { id: "p" });
    const subS1 = keat.variation("feature1", { id: "s" });
    const subR1 = keat.variation("feature1", { id: "r" });

    expect(subP1).toBe(true);
    expect(subS1).toBe(true);
    expect(subR1).toBe(true);

    const subP2 = keat.variation("feature2", { id: "p" });
    const subS2 = keat.variation("feature2", { id: "s" });
    const subR2 = keat.variation("feature2", { id: "r" });

    expect(subP2).toBe("advanced");
    expect(subS2).toBe("experimental");
    expect(subR2).toBe("advanced");
  });
});
