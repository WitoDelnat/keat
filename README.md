# [alpha] Keat

Keat is the Kubernetes-native feature management tool.

**Problem:** "I want to increase my deployment frequency while keeping control of my stability."

**Solution:** Put your new code behind feature flags, which is safe to deploy - even when it's still an ongoing effort. Afterwards gradually increase the reach and recover from failures within minutes.

## Why Keat

Getting started with feature flags should be frictionless.

There should be no need for build vs buy discussions. Building takes time and makes you lose focus, while buying requires budget approval. Most often it's a non-technical decision which makes kickoff a bigger deal than it is.

There should be no need for operational discussions. Free off the shelf solutions often require stateful deployments which are an entry barrier. With Keat you can start small and let your feature management solution evolve over time.

Keat succeeds when adding it for feature management is as boring as adding [jest][jest] for tests or [dotenv][dotenv] for configuration.

## Installation

Install the Keat client for NodeJs using `yarn`:

```
yarn add keat-node
```

or `npm`:

```
npm install keat-node
```

## Getting started

Keat has two concepts: **features** and **audiences**.

Let's explore them through examples:

```typescript
import { Keat } from "keat-node";

export const features = Keat.create({
  features: [{ name: "new-ui", enabled: true }, { name: "recommendations" }],
});

features.isEnabled("new-ui");
```

**Features** represent our feature toggles.
Since features are enabled by default, both features are currently enabled to everyone.

You might want to limit the audience of a feature when it's still a work in progress:

```typescript
import { Keat } from "keat-node";

export const features = Keat.create({
  audiences: [
    {
      kind: "static",
      name: "developers",
      members: ["developer@yourcompany.com", "..."],
    },
    {
      kind: "random",
      name: "dark-canary",
      percentage: 5,
    },
  ],
  features: [
    { name: "new-ui" },
    { name: "recommendations", audiences: ["developers"] },
    { name: "sql-query-rewrite", audiences: ["developers", "dark-canary"] },
  ],
});

features.isEnabled("recommendations", user.email);
```

**Audiences** allow us to gradually expose our features.
The feature is enabled if the user is part of _any_ of the given audiences.

To illustrate, _sql-query-rewrite_ first checks whether the email is part of developer's members.
If not then afterwards Keat checks whether the request belongs to the lucky five percentage.
The feature will only be disabled when both checks fail.

### Keat ❤️ TypeScript

Both audience and feature names have their types completely inferred which makes accidental typos impossible.

```typescript
import { Keat } from "keat-node";

export const features = Keat.create({
  audiences: [
    {
      kind: "static",
      name: "developers",
      members: ["developer@yourcompany.com", "..."],
    },
  ],
  features: [
    { name: "new-ui", audiences: ["beta-testers"] }, // Type '"beta-testers"' is not assignable
    { name: "recommendations", audiences: ["developers"] }, // ok
  ],
});

features.isEnabled("ui"); // Type '"ui"' is not assignable
features.isEnabled("new-ui"); // ok
```

## The road to decoupling release from deploy

**Toggling a feature** allows us to enable or disable it.
It's the bread and butter of feature management tools.
The ability to quickly toggle a feature will give you the confidence to move faster.
Generally you'll make a trade-off between propagation speed and operational complexity.

### Use environment variables

Your features are likely to vary between deploys, which is why it should be part of your app's config.
[The twelve-factor methodology][12factor] recommends to store this configuration in environment variables.

You could implement this as follows:

```typescript
import dotenv from "dotenv";
import { Keat } from "keat-node";

export const features = Keat.create({
  features: [
    {
      name: "new-ui",
      enabled: process.env.ENABLE_NEW_UI === "true",
    },
    {
      name: "recommendations",
      audiences: [process.env.ENABLE_RECOMMENDATIONS_TO],
    },
  ],
});

features.isEnabled("new-ui");
```

And afterwards start the application with these environment variables:

```bash
ENABLE_NEW_UI=true
ENABLE_RECOMMENDATIONS_TO=everyone
```

As seen in the example above, you can opt to use environment variables in combination with _audiences_.
To facilitate this, Keat provides two default audiences `'nobody'` and `'everyone'`.

### Use Keat server

Changing environment variables requires redeploying your containers.
A common reason to outgrow the solution above is when you want to decouple deploy from release.
When you reach this point it's a great moment to [get started with Keat server][keat-server].

The client can be initialised as follows:

```typescript
import { Keat } from "keat-node";

(async () => {
  export const features = Keat.fromKeatServer({
    strict: ["new-ui", "recommendations"],
    logger: true,
  });

  await features.ready;

  features.isEnabled("new-ui");
})();
```

This will periodically synchronise your client with the server.
The optional `strict` property performs run-time checks to make sure your features are present.
Currently, Keat will simply log strict check failures and act as if the feature was disabled to avoid bringing down your service.

## Audiences

Currently there are two kinds of audiences: static and random.
Static allows you to add a list of members while random allows a certain percentage of requests to be enabled.

## More coming soon..

Keat is just getting started!

[12factor]: https://12factor.net/config
[keat-audiences]: https:www.google.con
[jest]: https://www.npmjs.com/package/jest
[dotenv]: https://www.npmjs.com/package/dotenv
[node-config]: https://www.npmjs.com/package/config
[keat-server]: https://github.com/WitoDelnat/keat-server#installation
