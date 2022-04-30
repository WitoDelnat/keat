import { Keat } from "./keat";

it("basic scenario", () => {
  const MOCKED_HASH = () => 67;
  const keat = new Keat(
    {
      audiences: {
        preview: (user) => ["p"].includes(user.sub),
        staff: (user) => ["s"].includes(user.sub),
      },
      features: {
        feature1: [true, false],
      },
      config: {
        // feature1: ["staff", 30]
        feature1: [
          [["staff"], false],
          [30, 100],
        ],
      },
    },
    MOCKED_HASH
  );

  const subP = keat.eval("feature1", { sub: "p" });
  const subS = keat.eval("feature1", { sub: "s" });
  const subR = keat.eval("feature1", { sub: "r" });

  expect(subP).toBe(false);
  expect(subS).toBe(true);
  expect(subR).toBe(false);
});

it("basic non-boolean scenario", () => {
  const MOCKED_HASH = jest.fn().mockReturnValueOnce(68).mockReturnValueOnce(20);
  const keat = new Keat(
    {
      audiences: {
        preview: (user) => ["p"].includes(user.sub),
        staff: (user) => ["s"].includes(user.sub),
      },
      features: {
        feature1: ["advanced", "experimental", "basic"],
      },
      config: {
        // feature1: [[30], ['staff']]
        feature1: [[false, ["staff"]], [30]],
      },
    },
    MOCKED_HASH
  );

  const subP = keat.eval("feature1", { sub: "p" });
  const subS = keat.eval("feature1", { sub: "s" });
  const subR = keat.eval("feature1", { sub: "r" });

  expect(subP).toBe("basic");
  expect(subS).toBe("experimental");
  expect(subR).toBe("advanced");
});
