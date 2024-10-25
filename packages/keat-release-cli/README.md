# Keat Release

## Welcome to Keat Release

Keat Release is a command-line interface for decoupling release from deploy in minutes. You can use it to add, toggle and remove feature flags - it's super simple.

Feature flags are tremendous but they introduce technical debt. Keat Release solves this by cleaning up your features for you. It's intelligent. Under the hood it will navigate and manipulate actual TypeScript abstract syntax trees to remove stale code with surgical precision.

## Installation

You can install the CLI with your favourite package manager.

With npm:

```bash
npm install --save-dev keat-release
```

With Yarn:

```
yarn add --dev keat-release
```

## Usage

### Decouple release from deploy

Create a Keat Cloud application and add configuration. It generates a _keat.config.ts_ and adds the _keatRelease_ plugin to your code.

```bash
npx keat init
```

### Add a feature flag

```bash
npx keat add your-new-feature
```

### Toggle a feature flag

```bash
npx keat release demo --stage production
```

Or do it interactively:

```bash
npx keat release
```

### Remove a feature flag

```bash
npx keat remove your-old-feature
```
