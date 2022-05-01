import { normalizeVariateRule, preprocessRule } from "./rules";

const normalize = normalizeVariateRule;

describe("normalize", () => {
  it("should work for a varia of cases", () => {
    const isMulti = true;
    expect(normalize([], !isMulti)).toEqual([[]]);
    expect(normalize([], isMulti)).toEqual([]);

    // bi-variates (e.g. true | false)
    expect(normalize(true, !isMulti)).toEqual([true]);
    expect(normalize(false, !isMulti)).toEqual([false]);
    expect(normalize("staff", !isMulti)).toEqual([["staff"]]);
    expect(normalize(50, !isMulti)).toEqual([[50]]);
    expect(normalize(["staff", 50], !isMulti)).toEqual([["staff", 50]]);
    expect(normalize(["preview", "staff"], !isMulti)).toEqual([
      ["preview", "staff"],
    ]);
    expect(normalize([30, 50], !isMulti)).toEqual([[30, 50]]);

    // multi-variates (e.g. advanced | experimental | basic)
    expect(normalize([false, true], isMulti)).toEqual([false, true]);
    expect(normalize([50, 80, 100], isMulti)).toEqual([[50], [80], [100]]);
    expect(normalize(["preview", "staff"], isMulti)).toEqual([
      ["preview"],
      ["staff"],
    ]);
    expect(normalize([["staff", 50], ["preview"], [100]], isMulti)).toEqual([
      ["staff", 50],
      ["preview"],
      [100],
    ]);
    expect(normalize([["staff", 50, 30], [25], [74]], isMulti)).toEqual([
      ["staff", 50, 30],
      [25],
      [74],
    ]);
  });
});

describe("preprocess", () => {
  it.only("should work for a varia of cases", () => {
    expect(preprocessRule([])).toEqual({
      targetPhase: false,
      rolloutPhase: false,
    });
    expect(preprocessRule([["staff", 50, 30], [60], [74]])).toEqual({
      targetPhase: [["staff"], false, false],
      rolloutPhase: [30, 60, 74],
    });
    expect(preprocessRule([["staff", "preview"], false, [74]])).toEqual({
      targetPhase: [["staff", "preview"], false, false],
      rolloutPhase: [false, false, 74],
    });
    expect(preprocessRule([["preview"], false, ["staff"]])).toEqual({
      targetPhase: [["preview"], false, ["staff"]],
      rolloutPhase: false,
    });
  });
});
