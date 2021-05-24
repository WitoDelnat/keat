# Keat

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

Let's explore them through basic examples:

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
  ],
  features: [
    { name: "new-ui" },
    { name: "recommendations", audiences: ["developers"] },
  ],
});

features.isEnabled("recommendations", user.email);
```

**Audiences** allow us to gradually expose our features.
This example works with a static list of members, though there are plenty of other strategies.

Keat loves TypeScript! Both audience and feature names have their types completely inferred which makes accidental typos impossible.

## The road to decoupling release from deploy

**Toggling a feature** allows us to enable or disable a feature.
It's the bread and butter of a feature management tool.
Quickly toggling a feature will give you the confidence to move fast.

### Use environment variables

Your features are likely to vary between deploys.
Modern applications often follow the [twelve-factor methodology][12factor] and store config in the environment.

Let's take a look at how you could implement this:

```typescript
import { Keat } from "keat-node";

export const features = Keat.create({
  features: [
    {
      name: "new-ui",
      enabled: process.env.ENABLE_NEW_UI === "true",
    },
    {
      name: "recommendations",
      audiences: [process.env.ENABLE_RECOMMENDATIONS],
    },
  ],
});

features.isEnabled("new-ui");
```

You can limit the exposure of your feature by using the _audiences_ property for your environment variables. This however requires an audience to enable the feature to everyone, which is why Keat provides a **default audience** called `everyone`.

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
