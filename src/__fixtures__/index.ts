import {
  audienceListResourceFixture,
  audienceResourceFixture,
} from "./audienceResource";
import { definitionsFixture } from "./definitions";
import {
  featureListResourceFixture,
  featureResourceFixture,
} from "./featureResource";
import { scenario } from "./fluse";

export * from "./audienceResource";
export * from "./featureResource";

export const basicResources = scenario()
  .with("developers", () =>
    audienceResourceFixture({
      kind: "static",
      name: "developers",
      members: ["dev1", "dev2"],
    })
  )
  .with("audienceList", ({ developers }) =>
    audienceListResourceFixture({ audiences: [developers] })
  )
  .with("newUi", () => featureResourceFixture({ name: "new-ui" }))
  .with("recommendations", () =>
    featureResourceFixture({
      name: "recommendations",
      audiences: ["developers"],
    })
  )
  .with("featureList", ({ newUi, recommendations }) =>
    featureListResourceFixture({ features: [newUi, recommendations] })
  )
  .compose();

export const basicDefinitions = scenario()
  .with("definitions", () =>
    definitionsFixture({
      audiences: [
        {
          kind: "static",
          name: "developers",
          members: ["dev1", "dev2"],
        },
      ],
      features: [
        {
          name: "new-ui",
        },
        {
          name: "recommendations",
          audiences: ["developers"],
        },
      ],
    })
  )
  .compose();
