# [beta] Keat

Progressive and type-safe feature flags.

An easy way to increase your deployment frequency and reduce stress of releases.

## Key Features

- 🚀 Progressive rollouts and 🎯 targeted audiences.
- 🧪 Bi- and multivariates of any type.
- 🛠 Remote configuration without vendor lock-in.
- 🌳 Lightweight core with tree shakeable plugins.
- 💡 Framework agnostic with React adaptor included.
- 💙 Amazing TypeScript support.

## Installation

```
npm install keat
```

## Basic concepts

First you define your **features** and their **variates**. You are not limited to traditional boolean flags and can use bi- or multivariates with strings, numbers and even complex objects.

Afterwards you enable a feature's variate through Keat's **configuration** and extend its possibilities with **plugins** for progressive rollouts, targeted audiences, remote configuration and much more.

All of this comes with amazing TypeScript support - `keat.variation` knows your feature names and automatically infers the return type.

```typescript
import { Keat, booleanFlag, useRollouts } from "keat/core";

const keat = Keat.create({
  features: {
    search: booleanFlag, // alias for [true, false]
    redesign: booleanFlag,
    sortAlgorithm: ["quicksort", "heapsort", "insertionSort"],
  } as const,
  plugins: [useRollouts()],
  config: {
    search: true,
    sortAlgorithm: [20, 30, 50],
  },
});

keat.variation("search"); // returns `true`.
keat.variation("redesign"); // fallback to last variate `false`.
keat.variation("sortAlgorithm"); // returns `'quicksort'` for 20%, `'heapsort'` for 30% and `'insertionSort'` half of the time.
```

## Examples

### SaaS application

Modern web application where developers can test in production, gather feedback through early previews and progressively rollout to maximise the odds of success.

The **remote configuration** can simply return a JSON object in the same format of `config`. You can serve it from your API, cloud storage, Cloudflare CDN or even real-time through WebSockets and server-sent events.

```typescript
import { Keat, booleanFlag } from "keat/core";
import { useAudiences, useRemoteConfig, useRollouts } from "keat/plugins";

const keat = Keat.create({
  features: {
    search: booleanFlag,
    redesign: booleanFlag,
    sortAlgorithm: ["quicksort", "heapsort"],
  } as const,
  plugins: [
    useRemoteConfig("https://example.io/features", { interval: 300 }),
    useAudiences({
      staff: (user) => user.email?.endsWith("example.io"),
      preview: (user) => user.preview,
    }),
    useRollouts(),
  ],
  config: {
    search: ["staff", 5], // enabled for staff and 5% of users.
    sortAlgorithm: ["staff", "preview", 20], // `'quicksort'` for staff, preview and 20% of users - otherwise `'heapsort'`.
  },
});

// Consider using your access token with custom claims such as 'preview'.
const user = { sub: "abc", email: "dev@example.io", preview: true };
keat.variation("sortAlgorithm", user);
```

### Public landing page

Website without login or stable identity where you can still preview and A/B test optimal engagement.

The **configuration** can also be embedded at build time.
Environment variables favour operational simplicity over propagation speed.
Keat gives you all the benefits of feature flags without the burden of infrastructure or having to reach for your wallet.

```typescript
import { Keat, booleanFlag, fromEnv } from "keat/core";
import { useAnonymous, useAudiences, useRollouts } from "keat/plugins";

const keat = Keat.create({
  features: {
    search: booleanFlag,
    design: ["halloween", "default"],
    sortAlgorithm: ["quicksort", "heapsort"],
  } as const,
  plugins: [
    useAnonymous({ persist: true }),
    useAudiences({
      preview: () => {
        const queryString = window.location.search;
        const params = new URLSearchParams(queryString);
        return params.has("preview");
      },
      halloweenPeriod: () => {
        const now = Date.now();
        const start = new Date(2022, 10, 15).getTime();
        const end = new Date(2022, 11, 2).getTime();
        return start < now && now < end;
      },
    }),
    useRollouts(),
  ],
  config: {
    search: 30, // enabled for 30% of visitors.
    design: ["halloweenPeriod", "preview"], // enabled during Halloween and for preview.
    sortAlgorithm: fromEnv(process.env.ENABLE_SORT_ALGORITHM) ?? false,
  },
});

// User is automatically added with random identifier which is persisted across session.
keat.variation("advancedSearch");
```

### React

React application with hooks and components included through `KeatReact`.

Your remote configuration might be slow for a variety of reasons (e.g. viewer has slow 3G).
Keat's **feature display** allows you to optimize individual boundaries instead of blocking your whole application.
It will feel familiar for you who have worked with `font-display` ([Playground](https://font-display.glitch.me/), [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)).

```jsx
import React from "react";
import { KeatReact, booleanFlag, useRemoteConfig } from "keat";
import { Search, SearchSkeleton, SortedList } from "./components";

const { useKeat, FeatureBoundary } = KeatReact.create({
  features: {
    redesign: booleanFlag,
    search: booleanFlag,
    sortAlgorithm: ["quicksort", "heapsort"],
  } as const,
  plugins: [useRemoteConfig("https://example.io/slowConfig")],
});

export function App() {
  const { variation } = useKeat();

  return (
    <div>
      <h1>Keat</h1>

      <FeatureBoundary name="redesign" fallback={<p>Your old design</p>}>
        <p>Your new design</p>
      </FeatureBoundary>

      <FeatureBoundary
        name="search"
        display="block"
        invisible={<SearchSkeleton />}
      >
        <Search />
      </FeatureBoundary>

      <SortedList data={[1, 3, 4]} algorithm={variation("sortAlgorithm")} />
    </div>
  );
}
```

## Documentation

Coming soon

## License

MIT
