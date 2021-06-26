# [beta] Keat

Keat is a minimalistic feature management tool.

**Problem:** "I want to increase my deployment frequency while keeping control of my stability."

**Solution:** Put your new code behind feature flags, which is safe to deploy - even when it's still an ongoing effort. Afterwards gradually increase the reach and recover from failures within minutes.

## Why Keat

Getting started with feature flags should be frictionless.

There should be no need for build vs buy discussions. Building takes time and makes you lose focus, while buying requires budget approval. Most often it's a non-technical decision which makes kickoff a bigger deal than it is.

There should be no need for operational discussions. Free off the shelf solutions often require stateful deployments which forms an entry barrier. With Keat you can start small and let your feature management solution evolve over time.

Keat succeeds when adding it for feature management is as boring as adding [jest][jest] for tests or [dotenv][dotenv] for configuration.

## Installation

Install Keat for either NodeJs or the browser using `yarn`:

```
yarn add keat-node
```

or `npm`:

```
npm install keat-node
```

## Getting started

Keat has two main concepts: **features** and **audiences**.

Let's explore them through some examples:

```typescript
import { Keat } from "keat-node";

export const keat = Keat.create({
  features: [
    { name: "new-ui", audience: "everyone" },
    { name: "recommendations", audience: "nobody" },
  ],
});

keat.isEnabled("new-ui"); // true
keat.isEnabled("recommendations"); // false
```

The example has two features: _new-ui_ is enabled for everyone while _recommendations_ is always disabled.
The strenght of Keat's audience API is the ability to gradually expose your features.
In essence, you could say that features describe _what_ while audiences _to who_.

Let's imagine that the recommendation feature is finished:

```typescript
import { Keat } from "keat-node";

export const keat = Keat.create({
  features: [
    { name: "new-ui", audience: "everyone" },
    { name: "recommendations", audience: "sticky-xs" },
  ],
});

const user = { id: "40581df8-1790-441c-85fd-81f41a3c9be8" };
keat.isEnabled("recommendations", user.id); // true for 3% of users
```

By using an extra small sticky audience, recommendations are only rolled out to a few users.
Now you can build some confidence that everything works properly in production.
Maybe some complications occurred? Simply roll it back which remains unnoticed for the majority of your userbase.

### Keat :heart: TypeScript!

All audiences and feature names are completely inferred making typos unlikely.
Maintenance is also easier as you can remove features without worrying that you missed a guard.

```typescript
import { Keat } from "keat-node";

export const keat = Keat.create({
  features: [
    { name: "new-ui", audiences: ["everybody"] }, // Type '"everybody"' is not assignable
    { name: "recommendations", audiences: ["sticky-xs"] }, // ok
  ],
});

keat.isEnabled("ui"); // Type '"ui"' is not assignable
keat.isEnabled("new-ui"); // ok
```

## The road to decoupling release from deploy

**Toggling a feature** allows us to enable or disable it.
It's the bread and butter of feature management tools.
In Keat it means increasing or decreasing the reach of your audience.
The ability to quickly toggle a feature will give you the confidence to move faster.
Generally you'll make a trade-off between propagation speed and operational complexity.

### Use environment variables

Your features are likely to vary between deploys, which is why it should be part of your app's config.
It's recommended to store this configuration in environment variables.
Otherwise you'll have to rebuild your application which reduces propagation speed.

You can use the `fromEnv` utility to implement this as follows:

```typescript
import { Keat, fromEnv } from "keat-node";

export const keat = Keat.create({
  features: [
    {
      name: "new-ui",
      audience: fromEnv(process.env.ENABLE_NEW_UI_TO, "everyone"),
    },
    {
      name: "recommendations",
      audience: fromEnv(process.env.ENABLE_RECOMMENDATIONS_TO, "nobody"),
    },
  ],
});
```

And afterwards start the application with these environment variables:

```bash
ENABLE_RECOMMENDATIONS_TO=sticky-md
```

The _new-ui_ will fallback to `everyone`, while _recommendation_'s reach has been increased to a medium sticky audience.

### Use remote configuration

Changing environment variables still requires redeploying your web bundle or container.
A common reason to outgrow the solution above is when you want to decouple deploy from release.
When you reach this point it's a great moment to get started with remote configuration.

It's possible to integrate with any existing remote configuration tool.

```typescript
import { Keat } from "keat-node";

export const keat = Keat.create({
  features: [
    { name: "new-ui", audience: "everyone" },
    { name: "recommendations", audience: "nobody" },
  ],
  remoteConfig: {
    kind: "poll",
    fetch: async () => {
      const response = await fetch("http://localhost:8080/config");
      if (!response.ok) throw new Error("request failed");
      return await response.json();
    },
  },
});
```

The response is simply a record where a feature name maps to its audience:

```json
{
  "recommendations": "sticky-lg"
}
```

The _new-ui_ will remain enabled to `everyone`.
_Recommendation_'s reach has been increased once more, this time to a large audience.
By default, Keat will fetch the remote configuration every minute and merge the received audiences.

## Users

Let's take a closer look at users before we dive into the possibilities of audiences.
Out of the box the user is a `string` to keep it simple.
It's likely that this is to limiting once you start segregating your users based on characteristics.
That is why you can define your own user with declaration merging:

```typescript
import { Keat } from "keat-node";

declare module "keat-node" {
  interface KeatNode {
    user: {
      id: string;
      email: string;
      developerPreview: boolean;
    };
  }
}

const keat = Keat.create({
    { name: "new-ui", audience: "everyone" },
    { name: "recommendations", audience: "sticky-xs" },
});

const user = {
  id: "40581df8-1790-441c-85fd-81f41a3c9be8",
  email: "developer@example.com",
  developerPreview: true,
};

keat.isEnabled("recommendations", user.id); // Type 'string' is not assignable
keat.isEnabled("recommendations", user); // ok
```

The sticky audience requires a identifier to ensure the same experience across sessions.
You will need to configure this key whenever it's different then the default `'id'`.
To illustrate, you would use ID tokens as follows:

```typescript
import { Keat } from "keat-node";

declare module "keat-node" {
  interface KeatNode {
    user: {
      sub: string;
      name: string;
      email: string;
      customClaim: string;
    };
  }
}

const keat = Keat.create({
  features: [
    { name: "new-ui", audience: "everyone" },
    { name: "recommendations", audience: "sticky-xs" },
  ],
  userConfig: {
    idKey: "sub",
  },
});
```

## Audiences

### Custom audiences

Bringing your own user opens the door to segregating your userbase in custom audiences.
This is commonly used to give early access to a select group of users.

```typescript
const team = [
  "838287ef-f6af-4da6-a30d-76f4f3056ad6",
  "998c6f25-b075-427f-9303-cb43be1e0066",
  "...",
];

declare module "keat-node" {
  interface KeatNode {
    user: {
      id: string;
      betaPreview: boolean;
    };
  }
}

export const keat = Keat.create({
  audiences: [
    {
      name: "developers",
      includes: (user) => (user ? team.includes(user) : false),
    },
    {
      name: "beta",
      includes: (user) => user?.betaPreview ?? false,
    },
  ],
  features: [
    { name: "new-ui", audience: "everyone" },
    { name: "recommendations", audience: ["developers", "beta", "sticky-xs"] },
  ],
  userConfig: {
    idKey: "sub",
  },
});
```

_Recommendation_ will be enabled when the user is either part of the development team, signed up for beta testing or is included in the few lucky users of the sticky audience.

**Environment variables and remote config**

You can use a comma-separated string for multiple audiences.
To keep it simple and consistent, **it's not allowed to use a string array in the remote configuration JSON**.

```bash
ENABLE_RECOMMENDATIONS_TO=developers,beta,sticky-md
```

```json
{
  "recommendations": "developers, beta, sticky-md"
}
```

### Default audiences

Keat ships with a bunch of audiences to get you started.
The following table summarizes which requests and users are enabled.
_User_ means that inclusion will be consistent, while with _request_ it can change between requests of the same user:

| Name      | Includes         |
| --------- | ---------------- |
| everyone  | 100% of requests |
| nobody    | 0% of requests   |
| dark-xs   | 3% of requests   |
| dark-sm   | 10% of requests  |
| dark-md   | 25% of requests  |
| dark-lg   | 50% of requests  |
| dark-xl   | 75% of requests  |
| sticky-xs | 3% of users      |
| sticky-sm | 10% of users     |
| sticky-md | 25% of users     |
| sticky-lg | 50% of users     |
| sticky-xl | 75% of users     |

## More coming soon..

Keat is just getting started!

[jest]: https://www.npmjs.com/package/jest
[dotenv]: https://www.npmjs.com/package/dotenv
