# Keat

Progressive and type-safe feature flags for Node.js and the browser.

Keat is currently in Beta.

**Problem:** "I want to increase my deployment frequency, reduce stress of releases and/or gather the preferences of my users."

**Solution:** Put your new code behind feature flags, which is safe to deploy - even when it's still an ongoing effort. Afterwards gradually increase the reach and recover from failures within minutes.

## Getting started

Install Keat using `yarn`:

```
yarn add -D keat
```

or `npm`:

```
npm install --save-dev keat
```

## The gist

Define your user model, audiences and features:

```typescript
import { Keat } from "keat";

declare module "keat" {
  interface KeatNode {
    user: {
      id: string;
      email: string;
      earlyPreview: boolean;
    };
  }
}

const keat = Keat.create({
  audiences: {
    staff: (user) => user?.email.includes("@example.com") ?? false,
    beta: (user) => user?.earlyPreview ?? false,
  },
  features: {
    redesign: "staff", // Enabled for your colleagues
    recommendations: "everyone", // Enabled for everyone
    chatbot: ["staff", "sticky-md"], // Enabled for your colleagues and 25% of users
    sqlQueryRewrite: "dark-xs", // Enabled for 3% of requests
  },
});
```

Start using your feature flags:

```typescript
if (keat.isEnabled("sqlQueryRewrite")) {
  // your new fast and maybe unstable query
} else {
  // your old slow query
}
```

Discover more about Keat:

- [Why use feature flags?](https://github.com/WitoDelnat/keat/wiki)
- [Enable flags for particular users](https://github.com/WitoDelnat/keat/wiki/Enable-flags-for-particular-users)
- [Enable flags for a percentage of users](https://github.com/WitoDelnat/keat/wiki/Enable-flags-for-a-percentage-of-users)
- [Toggle flags with environment variables or remote configuration](https://github.com/WitoDelnat/keat/wiki/Toggle-feature-flags)

## License

MIT
