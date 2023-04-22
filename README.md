# Keat

Progressive and type-safe feature flags.

An easy way to increase your deployment frequency and reduce stress of releases.

## Key Features

- 🚀 Progressive rollouts, 🎯 targeted audiences and 📅 scheduled launches.
- 🛠 Remote configuration without vendor lock-in.
- 💙 Amazing TypeScript support.
- 💡 Framework agnostic with React adaptor included.
- 🌳 Lightweight core with tree shakeable plugins.
- 🧪 Bi- and multivariates of any type.

## Getting started

Start by adding Keat to your codebase:

```bash
npm install keat
```

After installing Keat, you can define your first **feature** together with its **rule**.

```typescript
import { keatCore } from "keat";

const { variation } = keatCore({
  features: {
    recommendations: true,
  },
});

variation("recommendations") === true;
```

By default the rule can either be `true` or `false`, respectively to enable or disable it.
This is not very useful so let's continue by adding **plugins** to supercharge Keat.

### Enable features for particular users

Enabling features for particular users allows you to test in production and preview releases to your adventurous users.

To do this you use the `audience` plugin.
This plugin looks whether the rule contains its name and enables the feature when its function evaluates truthy.

```typescript
import { keatCore, audience } from "keat";

const { variation } = keatCore({
  features: {
    recommendations: "staff",
  },
  plugins: [audience("staff", (user) => user.email?.endsWith("example.io"))],
});

variation("recommendations", { email: "dev@example.io" }) === true;
variation("recommendations", { email: "jef@gmail.com" }) === false;
```

### Enable features for a percentage of users

Enabling features for a percentage of users allows canary and A/B testing.
By releasing to a small and gradually increasing amount of users you gain the confidence you need.

To do this you use the `rollouts` plugin.
This plugin takes the first `number` of a rule and enables the feature for a percentage of users equal to that amount. Under the hood a murmurhash will ensure sticky behavior across sessions for the same user.

```typescript
import { keatCore, audience, rollouts } from "keat";

const { variation } = keatCore({
  features: {
    recommendations: { OR: ["staff", 25] },
  },
  plugins: [
    audience("staff", (user) => user.email?.endsWith("example.io")),
    rollouts(),
  ],
});

variation("recommendations", { email: "dev@example.io" }) === true;
variation("recommendations", { email: randomEmail() }); // `true` for 25% of users.
```

You might also wonder how multiple plugins relate to each other.
Plugins are evaluated in FIFO order, so in this example the audiences are checked before the rollouts.
The evaluation short-circuits whenever a plugin sets a result,
and when none is set the default behavior is used instead.

### Toggle features remotely

Toggling features is the bread and butter of any feature management tool.

Keat uses **configuration** to toggle features.

The format is a basic JSON object that maps the feature to its updated rule:

```json
{
  "recommendations": { "OR": ["staff", 50] }
}
```

The plain format combined with custom plugins means possibilities are endless:

- Serve from Cloud Object Storage or embed it within your API.
- Use CloudFlare at edge or tools like Firebase Remote configuration.
- Open a WebSocket or use server-sent events to stream changes in real-time.

Or you can use the build-in `remoteConfig` to fetch it from an endpoint:

```typescript
import { keatCore, remoteConfig, audience, rollouts } from "keat";

const { variation } = keatCore({
  features: {
    recommendations: false,
  },
  plugins: [
    remoteConfig("http://example.io/config", { interval: 300 }),
    audience("staff", (user) => user.email?.endsWith("example.io")),
    rollouts(),
  ],
});
```

## Examples

### Public landing page

Website without login or stable identity where you can still preview and A/B test optimal engagement.

Consider embedding **configuration** at build time since modern CI can rebuild it within a minute or two.
Environment variables favour operational simplicity over propagation speed.
You can get all the benefits of feature flags without the burden of infrastructure.

```typescript
import { keatCore, localConfig, …, rollouts } from "keat";
import featureJson from "./features.json";

export const keat = keatCore({
  features: {
    search: 30,
    halloweenDesign: { OR: ["preview", "2022-10-20"] },
  },
  plugins: [
    localConfig({
      ...featureJson,
      search: fromEnv(process.env["TOGGLE_SEARCH"]),
    }),
    anonymous({ persist: true }),
    queryParam("preview"), // takes "preview" and toggles when "preview" is in the URL's query parameters.
    launchDay(), // takes all ISO 8601 date strings and toggles when the date is in the past.
    rollouts(),
  ],
});
```

### Microservice with NodeJs

Keat works both in the browser and on NodeJs. Use it to measure performance optimizations, gradually migrate to a new integration or degrade your services when there is trouble on the horizon.

Keat is not restricted traditional boolean flags. Use **bi- or multi-variates of any type** to be more expressive in your feature flags. Keat will also properly infer the return type of your variates so you get immediate feedback on your usage.

```typescript
import { keatCore, rollouts } from "keat";

export const keat = keatCore({
  features: {
    enableJitCache: 50,
    notificationService: {
      variates: ["modern", "legacy"],
      when: 5,
    },
    rateLimit: {
      variates: [
        {
          level: "default",
          average: 1000,
          burst: 2000
        },
        {
          level: "degraded",
          average: 500,
          burst: 800,
        },
        {
          level: "disaster",
          average: 100,
          burst: 150,
        },
      ],
      when: [false, true, false],
    },
  } as const, // tip: use `as const` to narrow the return types
  plugins: [rollouts()],
});

keat.variation("notificationService");
ReturnType<typeof keat.variation("rateLimit")> = { level: string; average: number; burst: number};
ReturnType<typeof keat.variation("notificationService")> = "modern" | "legacy"; // or `string` without `as const`
```

### SaaS application with React

Modern web application where developers can test in production, gather feedback through early previews and progressively rollout to maximise the chance of success.

Your remote configuration might be slow for a variety of reasons (e.g. viewer has slow 3G).
With **feature display** you can optimize individual boundaries instead of blocking your whole application.
It will feel familiar if you've worked with `font-display` before ([Playground](https://font-display.glitch.me/), [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)).

```tsx
import { keatReact, audience, remoteConfig, rollouts } from "keat";

const { useKeat, FeatureBoundary } = keatReact({
  features: {
    search: false,
    redesign: false,
    sortAlgorithm: {
      variates: ["quicksort", "insertionSort", "heapsort"],
    },
  } as const,
  plugins: [
    remoteConfig("https://example.io/slowConfig", { interval: 300 }),
    audience("staff", (user) => user.email?.endsWith("example.io")),
    audience("preview", (user) => user.settings.previewEnabled),
    rollouts(),
  ],
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

## Plugins

### Build-in plugins

Rules:

- **audience** checks whether the rule contains its name and enables the feature when its function responds truthy.
- **queryParam** checks whether the rule contains its name and enables the feature depending on the URLs query parameter.
- **rollouts** takes the first `number` and enables the feature for a percentage of users equal to that amount.
- **launchDay** takes all `ISO 8601 date strings` and enables the feature when the date is in the past.

Configurations:

- **localConfig** fetches your configuration from a local JSON file or environment variables.
- **remoteConfig** fetches your configuration from a remote endpoint, which allows decoupling deploy from release.
- **customConfig** fetches your configuration with a customizable fetch.

Miscellaneous:

- **cache** adds simple caching to your evaluations which improve performance.
- **anonymous** adds a generated, stable identity, which allows reliable rollout results.

### Custom plugins

Plugins are plain old JavaScript objects with a simple interface that hooks
into the lifecycle of Keat. Checkout [the common plugin interface on GitHub](https://github.com/WitoDelnat/keat/blob/main/src/core/plugin.ts) to get a full view on the available context and API.

Here is the code for the launch day plugin:

```typescript
export const launchDay = () => {
  createPlugin({
    matcher: isDate,
    evaluate({ literal }) {
      return literal.getTime() < Date.now();
    },
  });
};
```

## License

MIT
