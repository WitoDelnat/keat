import { fromEnv, Keat } from "./src";

// This file tests declaration merging and environment variables.
// test with `yarn build && ENABLE_TEST_TO=developers,canary yarn ts-node test-d.ts`
declare module "./src" {
  interface KeatNode {
    user: {
      name: string;
      email: string;
      developerPreview: boolean;
    };
  }
}

const keat = Keat.create({
  audiences: {
    developers: (user) => user?.name === "john" ?? false,
    preview: (user) => user?.developerPreview ?? false,
    staff: (user) => user.email.includes("@example.com") ?? false,
  },
  features: {
    test: fromEnv(process.env.ENABLE_TEST_TO),
    redesign: ["preview", "staff"],
  },
});

(async () => {
  await keat.ready;

  const user = {
    email: "john.doe@example.com",
    developerPreview: false,
    name: "john",
  };

  console.log(`test is ${keat.isEnabled("test", user)}`);

  await keat.stop();
})();
