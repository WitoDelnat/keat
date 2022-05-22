import { describe, expect, it } from "vitest";
import { normalize } from "../src/core/rules";

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
    expect(normalize([30, "staff"], isMulti)).toEqual([[30], ["staff"]]);
  });
});
