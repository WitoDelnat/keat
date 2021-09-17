import { fromEnv, Keat } from "./src";

// This file tests declaration merging and environment variables.
// test with `yarn build && ENABLE_TEST_TO=developers,canary yarn ts-node test-d.ts`
declare module "./src" {
  interface CustomTypes {
    user: {
      id: string;
      email: string;
      earlyPreview: boolean;
    };
  }
}

const keat = Keat.create({
  identifier: "id",
  audiences: {
    preview: (user) => user?.earlyPreview ?? false,
    staff: (user) => user?.email.includes("@example.com") ?? false,
  },
  features: {
    test: fromEnv(process.env.ENABLE_TEST_TO),
    redesign: ["preview", "staff"],
    search: "everyone",
  },
  remoteConfig: {
    kind: "keat",
    origin: "http://localhost:8080",
    application: "demo",
    onError: (err) => console.error(err.message),
  },
});

(async () => {
  console.log("start");
  await keat.ready;

  const user = {
    id: "123",
    email: "john.doe@example.com",
    earlyPreview: false,
  };

  console.log(`test is ${keat.isEnabled("test", user)}`);
  console.log(`search is ${keat.isEnabled("search", user)}`);

  await keat.stop();
})();
