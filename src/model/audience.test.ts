import { EVERYONE, NOBODY, RandomAudience, StaticAudience } from "./audience";
import faker from "faker";

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
    const audience = new StaticAudience("test", ["foo", "bar"]);
    expect(audience.isEnabled("baz")).toBe(false);
  });

  it("should be enabled when the user is part of members", () => {
    const audience = new StaticAudience("test", ["foo", "bar"]);
    expect(audience.isEnabled("foo")).toBe(true);
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

    const audience = new RandomAudience("test", 25);

    expect(audience.isEnabled()).toBe(true);
    expect(audience.isEnabled()).toBe(false);
    expect(audience.isEnabled()).toBe(false);
    expect(audience.isEnabled()).toBe(false);
  });
});
