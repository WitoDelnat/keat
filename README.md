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

Keat has two main concepts: **features** and **audiences**.

Let's explore them through some examples:

```typescript
import { Keat } from "keat-node";

export const keat = Keat.create({
  features: [
    { name: "new-ui", enabled: true },
    { name: "recommendations" },
    { name: "sql-query-rewrite" },
  ],
});

keat.isEnabled("new-ui");
```

**Features** represent our feature toggles.
Since features are enabled by default, all three features are currently enabled to everyone.

You might want to limit the audience of a feature when it's still a work in progress:

```typescript
import { Keat } from "keat-node";

export const keat = Keat.create({
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

keat.isEnabled("recommendations", user.email);
```

**Audiences** allow us to gradually expose our features.
The feature is enabled if the user is part of _any_ of the given audiences.

To illustrate, _sql-query-rewrite_ first checks whether the email is part of the developer audience's members.
Afterwards fate will decide whether the request belongs to the lucky five percentage.
Only when both checks fail will the feature be disabled.

### Keat ❤️ TypeScript

Both audience and feature names have their types completely inferred which makes accidental typos impossible.

```typescript
import { Keat } from "keat-node";

export const keat = Keat.create({
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

keat.isEnabled("ui"); // Type '"ui"' is not assignable
keat.isEnabled("new-ui"); // ok
```

## The road to decoupling release from deploy

**Toggling a feature** allows us to enable or disable it.
It's the bread and butter of feature management tools.
The ability to quickly toggle a feature will give you the confidence to move faster.
Generally you'll make a trade-off between propagation speed and operational complexity.

### Use environment variables

Your features are likely to vary between deploys, which is why it should be part of your app's config.
It's recommended to store this configuration in environment variables.
Otherwise you'll have to rebuild your application which reduces propagation speed.

You could implement this as follows:

```typescript
import dotenv from "dotenv";
import { Keat } from "keat-node";

export const keat = Keat.create({
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

keat.isEnabled("new-ui");
```

And afterwards start the application with these environment variables:

```bash
ENABLE_NEW_UI=true
ENABLE_RECOMMENDATIONS_TO=everyone
```

As seen in the example above, you can opt to use environment variables in combination with _audiences_.
To facilitate this, Keat provides two default audiences `'nobody'` and `'everyone'`.

### Use Keat server

Changing environment variables still requires redeploying your containers.
A common reason to outgrow the solution above is when you want to decouple deploy from release.
When you reach this point it's a great moment to [get started with Keat server][keat-server].

The client can be initialised as follows:

```typescript
import { Keat } from "keat-node";

(async () => {
  export const keat = Keat.fromKeatServer({
    strict: ["new-ui", "recommendations"],
    logger: true,
  });

  await keat.ready;

  keat.isEnabled("new-ui");
})();
```

This will periodically synchronise your client with the server.
The optional `strict` property performs run-time checks to make sure your features are present.
Currently, Keat will simply log strict check failures and act as if the feature was disabled to avoid bringing down your service.

## Audiences

Currently there are three kinds of audiences:

- Static includes users who are part of the list of members, which is commonly used to give early access to a select group of users.
- Random includes a given percentage of requests, which is commonly used to canary test internal implementation refactors.
- Sticky includes a given percentage of requests which sticks to the user, which is commonly used to canary test new features. Each feature will stick differently so the users users so not always the same users get to test the new features.

## Users

Users allow you to make your audiences conditionally.

**Get all features for a user**

`keat.getFor(user)` will retrieve all features for your user.
Combine it with labels to return subsets.

For example, you could write a simple REST endpoint which returns a list of features of the user and afterwards conditionally render depending on whether the feature is present in the list.

```typescript
import { Keat } from "keat-node";

const keat = Keat.create({
  features: [
    { name: "chat-bot", labels: { app: "frontend" } },
    { name: "ui-redesign", labels: { app: "frontend" } },
    { name: "sql-query-rewrite" },
  ],
});

// Example resolver
fastify.get("/user/${id}/features", async (request, response) => {
  const userId = request.params.id;
  const user = await fastify.userRepository.get(userId);
  const features = keat.getFor(user.email, { app: "frontend" });
  return response.code(200).send(features); // Returns ["chat-box", "ui-redesign"]
});
```

**Bring your own user**

Out of the box the user is a `string` to keep it simple. It's likely though that this is to limiting as your audiences grow. At that point you can define your own user with declaration merging:

```typescript
import { Keat } from "keat-node";

declare module "keat-node" {
  interface KeatNode {
    user: {
      email: string;
      developerPreview: boolean;
    };
  }
}

const keat = Keat.create({
  audiences: [
    {
      kind: "static",
      name: "developers",
      key: "email",
      members: ["developer@example.com"],
    },
    {
      kind: "static",
      name: "preview",
      key: "developerPreview",
      members: [true],
    },
  ],
  features: [{ name: "example", audiences: ["developers"] }],
});

keat.isEnabled("example", {
  email: "developer@example.com",
  developerPreview: true,
});
```

Also here will TypeScript help you to avoid mistakes:

```typescript
import { Keat } from "keat-node";

declare module "keat-node" {
  interface KeatNode {
    user: { email: string };
  }
}

const keat = Keat.create({
  audiences: [
    {
      kind: "static",
      name: "oops",
      members: ["tester@example.com"],
    }, // Property 'key' is missing in type
  ],
  features: [{ name: "example", audiences: ["oops"] }],
});

keat.isEnabled("example", user.email); // Type 'string' is not assignable
```

## More coming soon..

Keat is just getting started!

[jest]: https://www.npmjs.com/package/jest
[dotenv]: https://www.npmjs.com/package/dotenv
[keat-server]: https://github.com/WitoDelnat/keat-server#installation
