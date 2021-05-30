import faker from "faker";
import { createAudience, EVERYONE, NOBODY } from "./audience";

describe("everyone", () => {
  it("should always be enabled", () => {
    expect(EVERYONE.isEnabled()).toBe(true);
    expect(EVERYONE.isEnabled(faker.random.word())).toBe(true);
  });
});

describe("nobody", () => {
  it("should always be disabled", () => {
    expect(NOBODY.isEnabled()).toBe(false);
    expect(NOBODY.isEnabled(faker.random.word())).toBe(false);
  });
});

describe("static", () => {
  it("should be disabled when the user is not part of members", () => {
    const audience = createAudience({
      kind: "static",
      name: "test",
      members: ["usr1", "usr2"],
    });

    expect(audience.isEnabled("usr3")).toBe(false);
  });

  it("should be enabled when the user is part of members", () => {
    const audience = createAudience({
      kind: "static",
      name: "test",
      members: ["usr1", "usr2"],
    });

    expect(audience.isEnabled("usr1")).toBe(true);
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

    expect(audience.isEnabled()).toBe(true);
    expect(audience.isEnabled()).toBe(false);
    expect(audience.isEnabled()).toBe(false);
    expect(audience.isEnabled()).toBe(false);
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
      const res = audience.isEnabled(usr);

      for (let j = 0; j < 3; j++) {
        expect(audience.isEnabled(usr)).toBe(res);
      }
    }
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
      const res = audience.isEnabled(usr);

      if (res) {
        amountEnabled++;
      }
    }

    const deviation = Math.abs(amountEnabled - (TOTAL * PERCENTAGE) / 100);
    expect(deviation).toBeLessThan(LEEWAY);
  });
});
