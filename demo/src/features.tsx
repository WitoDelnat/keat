import {
  booleanFlag,
  Keat,
  useAnonymous,
  useAudiences,
  useRemoteConfig,
  useRollouts,
} from 'keat';
import React, { ReactNode } from 'react';

declare module 'keat' {
  interface CustomTypes {
    user: {
      id: string;
      email: string;
      earlyPreview: boolean;
    };
  }
}

type ExtractFeatures<K> = K extends Keat<infer K> ? keyof K : never;
type Feature = ExtractFeatures<typeof keat>;

export const keat = Keat.create({
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
    chatbot: 80,
    redesign: ['preview', 'staff'],
    search: true,
  },
});

export function useFeatureFlag({ name }: { name: Feature }) {
  return keat.eval(name);
}

type Props = {
  name: Feature;
  children: ReactNode;
};

export function FeatureFlag({ name, children }: Props) {
  const isEnabled = useFeatureFlag({ name });
  console.log('feature flag', name, isEnabled);
  return isEnabled ? <>{children}</> : null;
}
