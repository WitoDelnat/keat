# [beta] Feature flags with Keat

**Problem:** "I want to increase my deployment frequency, reduce stress of releases and/or gather the preferences of my users."

**Solution:** Put your new code behind feature flags, which is safe to deploy even when development is still an ongoing effort. Afterwards gradually increase the reach and recover from failures within minutes.

## Keat Key Features

- Supports progressive rollouts and targeted audiences.
- Supports bi- and multivariates of any type.
- Remote configuration with no vendor lock-in.
- Lightweight core with tree shakeable plugins.
- Agnostic to the frontend framework.
- Amazing TypeScript support.

## Installation

```
npm install keat
```

## Basic concepts

First you define your **features** and their **variates**. You are not limited to traditional boolean flags and can use bi- or multivariates with strings, numbers and even complex objects.

Afterwards you enable a feature's variate through Keat's **configuration** and extend its possibilities with **plugins** for progressive rollouts, targeted audiences, remote configuration and much more.

All of this comes with amazing TypeScript support. `keat.eval` knows your feature names and automatically infers the return type. This helps reduce the technical debt commonly associated with feature flags.

```typescript
import { Keat, booleanFlag } from "keat/core";

const keat = Keat.create({
  features: {
    redesign: booleanFlag, // alias for [true, false]
    sortAlgorithm: ["quicksort", "heapsort", "insertionSort"],
    foo: [5, "a"],
    bar: ["b", 3, { hello: "world" }],
  } as const,
  config: {
    redesign: true,
    sortAlgorithm: [false, true, false],
  },
});

keat.eval("redesign"); // returns `true`.
keat.eval("sortAlgorithm"); // returns `'heapsort'`.
keat.eval("foo"); // fallback to last variate `'a'`.
keat.eval("bar"); // fallback to last variate `{ hello: "world" }`.
```

## Examples

Checkout these realistic examples to see whether Keat fits your needs.
You can read the full documentation here and please don't hesitate to reach out to me if something is missing - Keat becomes better together!

### SaaS application

Example for a web application where you want to allow your developers to see features as they are still being developed, can show them in an early preview and progressively roll them out to reduce stress of failure.

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

// User could be access token with custom 'preview' claim.
const user = { sub: "abc", email: "dev@example.io", preview: true };
keat.eval("sortAlgorithm", user);
```

#### Public website without login

Example of how you could get the benefits of feature flags despite having no stable identity for visitors.

```typescript
import { Keat, booleanFlag, fromEnv } from "keat/core";
import { useAnonymous, useAudiences, useRollouts } from "keat/plugins";

const keat = Keat.create({
  features: {
    advancedSearch: booleanFlag,
    design: ["halloween", "default"],
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
    advancedSearch: fromEnv(process.env.ENABLE_ADVANCED_SEARCH),
    design: ["halloweenPeriod", "preview"], // enabled during Halloween and for preview.
  },
});

// User is automatically added with random identifier which is persisted across session.
keat.eval("advancedSearch");
```

## License

MIT
