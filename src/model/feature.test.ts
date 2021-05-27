import { EVERYONE, NOBODY } from "./audience";
import { Feature } from "./feature";

it("should be enabled by default", () => {
  const feature = new Feature({ name: "test" });
  expect(feature.isEnabled()).toBe(true);
});

it("should prioritise `enabled` over `audiences`", () => {
  const feature = new Feature({
    name: "test",
    enabled: false,
    audiences: [EVERYONE],
  });
  expect(feature.isEnabled()).toBe(false);
});

it("should be enabled if in any of the audiences matches", () => {
  const feature = new Feature({ name: "test", audiences: [NOBODY, EVERYONE] });
  expect(feature.isEnabled()).toBe(true);
});
