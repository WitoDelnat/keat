import faker from "faker";
import { Audience, DefaultAudience, DEFAULT_AUDIENCES } from "./audience";
import { Feature } from "./feature";

function getAudience(name: DefaultAudience) {
  const aud = DEFAULT_AUDIENCES[name];
  if (!aud) throw new Error();
  return aud;
}

describe("everyone", () => {
  it("should always be enabled", () => {
    const everyone = getAudience("everyone");
    expect(everyone.includes()).toBe(true);
    expect(everyone.includes(faker.random.word())).toBe(true);
  });
});

describe("nobody", () => {
  it("should always be disabled", () => {
    const nobody = getAudience("nobody");
    expect(nobody.includes()).toBe(false);
    expect(nobody.includes(faker.random.word())).toBe(false);
  });
});

describe("custom", () => {
  it("should be disabled when the user is not part of members", () => {
    const audience = new Audience((user) => {
      return user ? ["usr1", "usr2"].includes(user) : false;
    });

    expect(audience.includes("usr3")).toBe(false);
  });

  it("should be enabled when the user is part of members", () => {
    const audience = new Audience((user) => {
      return user ? ["usr1", "usr2"].includes(user) : false;
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

    const audience = getAudience("dark-md");

    expect(audience.includes()).toBe(true);
    expect(audience.includes()).toBe(false);
    expect(audience.includes()).toBe(false);
    expect(audience.includes()).toBe(false);
  });
});

describe("sticky", () => {
  it("should respond the same for any given user.", () => {
    const audience = getAudience("sticky-md");

    for (let i = 0; i < 3; i++) {
      const usr = faker.datatype.uuid();
      const res = audience.includes(usr);

      for (let j = 0; j < 3; j++) {
        expect(audience.includes(usr)).toBe(res);
      }
    }
  });

  it("should vary between multiple features", () => {
    const audience = getAudience("sticky-lg");
    const feature1 = new Feature("canary-test", [audience]);
    const feature2 = new Feature("ab-test", [audience]);

    expect(feature1.isEnabled("usr")).toBe(feature2.isEnabled("usr"));
    expect(feature1.isEnabled("bar")).toBe(feature2.isEnabled("bar"));
    expect(feature1.isEnabled("foo")).not.toBe(feature2.isEnabled("foo"));
    expect(feature1.isEnabled("dev")).not.toBe(feature2.isEnabled("dev"));
  });

  it("should properly distribute all user", () => {
    const TOTAL = 2000;
    const PERCENTAGE = 25;
    const LEEWAY_PERCENTAGE = 5;
    const LEEWAY = (TOTAL * LEEWAY_PERCENTAGE) / 100;

    const audience = getAudience("sticky-md");

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
