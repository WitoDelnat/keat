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
  audiences: [
    {
      name: "developers",
      includes: (user) => user.name === "john",
    },
    {
      name: "preview",
      includes: (user) => user.developerPreview,
    },
    {
      name: "company-example",
      includes: (user) => user.email.includes("@example.com") ?? false,
    },
  ],
  features: [
    {
      name: "test",
      audience: fromEnv(process.env.ENABLE_TEST_TO),
    },
    {
      name: "new-ui",
      audience: "preview",
    },
  ],
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
