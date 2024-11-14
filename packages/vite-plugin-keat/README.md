# vite-plugin-keat

Vite plugin to Keat

## Installation

```sh
npm install --save-dev vite-plugin-keat
```

## Usage

Add the plugin to `vite.config.js`.

```js
import keat from 'vite-plugin-keat'

export default {
    plugins: [keat()],
    // ...
}
```

You can import JSON files as Keat Configuration.

```js
import cohorts from './keat.json?cohorts'

const keat = createKeat({
    features: {
        demo: true,
    },
    cohorts,
})
```

If you're using Typescript, add the declaration code to `vite-env.d.ts`

```ts
/// <reference types="vite-plugin-keat" />
```

## License

MIT
