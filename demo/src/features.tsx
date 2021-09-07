import React, { ReactNode } from 'react';
import { ExtractFeatures, Keat } from 'keat';

declare module 'keat' {
  interface CustomTypes {
    user: {
      id: string;
      email: string;
      earlyPreview: boolean;
    };
  }
}

type Feature = ExtractFeatures<typeof keat>;

export const keat = Keat.create({
  identifier: 'id',
  audiences: {
    preview: (user) => user?.earlyPreview ?? false,
    staff: (user) => user?.email.includes('@example.com') ?? false,
  },
  features: {
    chatbot: 5,
    redesign: ['preview', 'staff'],
    search: 'everyone',
  },
  remoteConfig: {
    kind: 'keat',
    origin: 'http://localhost:8081',
    application: 'demo',
    onError: (err) => console.error(err.message),
  },
});

export function useFeatureFlag({ name }: { name: Feature }) {
  return keat.isEnabled(name, {
    id: 'demo-id',
    email: 'demo@example.com',
    earlyPreview: false,
  });
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
