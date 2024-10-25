import { audience, keatReact, keatRelease } from "keat";

export const keat = keatReact({
  features: {
    "feature-1": true,
    "feature-2": false,
    TwoZero: false,
    ThreeZero: false,
    search: "staff",
    demo: false,
    baz: false,
    jeff: false,
  },
  plugins: [
    audience("preview", (user) => user.preview),
    keatRelease("01h9kar2ghfxw8gdxy5ty3wh1h"),
  ],
});

export const { FeatureBoundary, useKeat, useVariation } = keat;
