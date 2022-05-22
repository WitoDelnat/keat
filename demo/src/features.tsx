import {
  booleanFlag,
  KeatReact,
  useAnonymous,
  useAudiences,
  useRemoteConfig,
  useRollouts,
} from 'keat';

declare module 'keat' {
  interface CustomTypes {
    user: {
      id: string;
      email: string;
      earlyPreview: boolean;
    };
  }
}

export const { useKeat, FeatureBoundary } = KeatReact.create({
  features: {
    chatbot: booleanFlag,
    redesign: booleanFlag,
    search: booleanFlag,
  },
  plugins: [
    useRemoteConfig('http://localhost:8000/features.json'),
    useAnonymous(),
    useAudiences({
      preview: (user) => user?.earlyPreview ?? false,
      staff: (user) => user?.email.endsWith('@example.io') ?? false,
    }),
    useRollouts(),
  ],
  config: {
    chatbot: false,
    redesign: false,
    search: false,
  },
});
