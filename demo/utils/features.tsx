import { booleanFlag, keatReact, rollouts } from "keat";

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
  },
  plugins: [rollouts()],
  config: {
    chatbot: false,
    redesign: true,
    search: false,
  },
});
