import { Keat } from "./lib/keat";

declare module "./lib/keat" {
  interface KeatNode {
    user: { email: string };
  }
}

const keat = Keat.create({
  features: [{ name: "test" }],
});

keat.getFor({ email: "hello@example.com" });
