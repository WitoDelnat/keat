import faker from "faker";
import { createAudience, EVERYONE, NOBODY } from "./audience";

describe("everyone", () => {
  it("should always be enabled", () => {
    expect(EVERYONE.includes()).toBe(true);
    expect(EVERYONE.includes(faker.random.word())).toBe(true);
  });
});

describe("nobody", () => {
  it("should always be disabled", () => {
    expect(NOBODY.includes()).toBe(false);
    expect(NOBODY.includes(faker.random.word())).toBe(false);
  });
});

describe("static", () => {
  it("should be disabled when the user is not part of members", () => {
    const audience = createAudience({
      kind: "static",
      name: "test",
      members: ["usr1", "usr2"],
    });

    expect(audience.includes("usr3")).toBe(false);
  });

  it("should be enabled when the user is part of members", () => {
    const audience = createAudience({
      kind: "static",
      name: "test",
      members: ["usr1", "usr2"],
    });

    expect(audience.includes("usr1")).toBe(true);
  });
});

describe("random", () => {
  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
  });

  it("should allow a given percentage of requests", () => {
    jest
      .spyOn(global.Math, "random")
      .mockReturnValueOnce(0.22)
      .mockReturnValueOnce(0.44)
      .mockReturnValueOnce(0.66)
      .mockReturnValueOnce(0.88);

    const audience = createAudience({
      kind: "random",
      name: "test",
      percentage: 25,
    });

    expect(audience.includes()).toBe(true);
    expect(audience.includes()).toBe(false);
    expect(audience.includes()).toBe(false);
    expect(audience.includes()).toBe(false);
  });
});

describe("sticky", () => {
  it("should respond the same for any given user.", () => {
    const audience = createAudience({
      kind: "sticky",
      name: "test",
      percentage: 25,
    });

    for (let i = 0; i < 3; i++) {
      const usr = faker.datatype.uuid();
      const res = audience.includes(usr);

      for (let j = 0; j < 3; j++) {
        expect(audience.includes(usr)).toBe(res);
      }
    }
  });

  it("should vary between multiple audiences", () => {
    const canary = createAudience({
      kind: "sticky",
      name: "canary-test",
      percentage: 50,
    });
    const ab = createAudience({
      kind: "sticky",
      name: "ab-test",
      percentage: 50,
    });

    expect(canary.includes("usr")).toBe(ab.includes("usr"));
    expect(canary.includes("bar")).toBe(ab.includes("bar"));
    expect(canary.includes("foo")).not.toBe(ab.includes("foo"));
    expect(canary.includes("dev")).not.toBe(ab.includes("dev"));
  });

  it("should properly distribute all user", () => {
    const TOTAL = 2000;
    const PERCENTAGE = 25;
    const LEEWAY_PERCENTAGE = 5;
    const LEEWAY = (TOTAL * LEEWAY_PERCENTAGE) / 100;

    const audience = createAudience({
      kind: "sticky",
      name: "test",
      percentage: PERCENTAGE,
    });

    let amountEnabled = 0;

    for (let i = 0; i < TOTAL; i++) {
      const usr = faker.datatype.uuid();
      const res = audience.includes(usr);

      if (res) {
        amountEnabled++;
      }
    }

    const deviation = Math.abs(amountEnabled - (TOTAL * PERCENTAGE) / 100);
    expect(deviation).toBeLessThan(LEEWAY);
  });
});
