import faker from "faker";
import { Engine } from "./engine";

describe("everyone", () => {
  it("should always be enabled", () => {
    const engine = new Engine({ features: { test: "everyone" } });
    expect(engine.isEnabled("test")).toBe(true);
    expect(engine.isEnabled("test", faker.random.word())).toBe(true);
  });
});

describe("nobody", () => {
  it("should always be disabled", () => {
    const engine = new Engine({ features: { test: "nobody" } });
    expect(engine.isEnabled("test")).toBe(false);
    expect(engine.isEnabled("test", faker.random.word())).toBe(false);
  });
});

describe("rollout - dark", () => {
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

    const engine = new Engine({ features: { test: 25 } });

    expect(engine.isEnabled("test")).toBe(true);
    expect(engine.isEnabled("test")).toBe(false);
    expect(engine.isEnabled("test")).toBe(false);
    expect(engine.isEnabled("test")).toBe(false);
  });
});

describe("rollout - sticky", () => {
  it("should respond the same for any given user.", () => {
    const engine = new Engine({ features: { test: 25 } });

    for (let i = 0; i < 3; i++) {
      const usr = faker.datatype.uuid();
      const res = engine.isEnabled("test", usr);

      for (let j = 0; j < 3; j++) {
        expect(engine.isEnabled("test", usr)).toBe(res);
      }
    }
  });

  it("should vary between multiple features", () => {
    const engine = new Engine({
      features: { "canary-test": 50, "ab-test": 50 },
    });

    expect(engine.isEnabled("canary-test", "usr")).toBe(
      engine.isEnabled("ab-test", "usr")
    );
    expect(engine.isEnabled("canary-test", "bar")).toBe(
      engine.isEnabled("ab-test", "bar")
    );
    expect(engine.isEnabled("canary-test", "foo")).not.toBe(
      engine.isEnabled("ab-test", "foo")
    );
    expect(engine.isEnabled("canary-test", "dev")).not.toBe(
      engine.isEnabled("ab-test", "dev")
    );
  });

  it("should properly distribute all user", () => {
    const TOTAL = 2000;
    const PERCENTAGE = 25;
    const LEEWAY_PERCENTAGE = 5;
    const LEEWAY = (TOTAL * LEEWAY_PERCENTAGE) / 100;

    const engine = new Engine({ features: { test: 25 } });

    let amountEnabled = 0;

    for (let i = 0; i < TOTAL; i++) {
      const usr = faker.datatype.uuid();
      const res = engine.isEnabled("test", usr);

      if (res) {
        amountEnabled++;
      }
    }

    const deviation = Math.abs(amountEnabled - (TOTAL * PERCENTAGE) / 100);
    expect(deviation).toBeLessThan(LEEWAY);
  });
});

describe("custom", () => {
  it("should be disabled when the user is not part of members", () => {
    const engine = new Engine({
      audiences: {
        aud: (user) => (user ? ["usr1", "usr2"].includes(user) : false),
      },
      features: {
        test: "aud",
      },
    });

    expect(engine.isEnabled("test", "usr3")).toBe(false);
  });

  it("should be enabled when the user is part of members", () => {
    const engine = new Engine({
      audiences: {
        aud: (user) => (user ? ["usr1", "usr2"].includes(user) : false),
      },
      features: {
        test: "aud",
      },
    });

    expect(engine.isEnabled("test", "usr1")).toBe(true);
  });
});
