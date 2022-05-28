import { anonymous, audiences, booleanFlag, keatReact, rollouts } from "keat";

declare module "keat" {
  interface CustomTypes {
    user: {
      id: string;
      email: string;
      earlyPreview: boolean;
    };
  }
}

export const { useKeat } = keatReact({
  features: {
    chatbot: booleanFlag,
    redesign: booleanFlag,
    search: booleanFlag,
    demoRollouts: booleanFlag,
    demoAudiences: booleanFlag,
    demoAnonymous: booleanFlag,
  },
  plugins: [
    anonymous({ persist: true }),
    audiences({
      staff: (user) => user?.email.endsWith("@example.io"),
    }),
    rollouts(),
  ],
  config: {
    chatbot: false,
    redesign: true,
    search: false,
    demoRollouts: 25,
    demoAudiences: "staff",
    demoAnonymous: 50,
  },
});
