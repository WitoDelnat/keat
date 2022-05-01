import { Keat } from "./keat";

describe("keat", () => {
  it("basic scenario", () => {
    const MOCKED_HASH = () => 25;
    const keat = Keat.create({
      audiences: {
        preview: (user) => ["p"].includes(user.sub),
        staff: (user) => ["s"].includes(user.sub),
      },
      features: {
        feature1: [true, false],
        feature2: ["advanced", "experimental", "basic"],
      } as const,
      config: {
        feature1: ["staff", 30], // True for staff and 30%.
        feature2: [30, "staff"], // Experimental for staff and advanced for 30%.
      },
      hashFn: MOCKED_HASH,
    });

    const subP1 = keat.eval("feature1", { sub: "p" });
    const subS1 = keat.eval("feature1", { sub: "s" });
    const subR1 = keat.eval("feature1", { sub: "r" });

    expect(subP1).toBe(true);
    expect(subS1).toBe(true);
    expect(subR1).toBe(true);

    const subP2 = keat.eval("feature2", { sub: "p" });
    const subS2 = keat.eval("feature2", { sub: "s" });
    const subR2 = keat.eval("feature2", { sub: "r" });

    expect(subP2).toBe("advanced");
    expect(subS2).toBe("experimental");
    expect(subR2).toBe("advanced");
  });
});
