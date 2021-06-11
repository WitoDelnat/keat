import { definitionsFixture } from "../../keat-core/definitions.fixture";
import {
  audienceListResourceFixture,
  audienceResourceFixture,
} from "../../keat-kube/audienceResource.fixture";
import {
  featureListResourceFixture,
  featureResourceFixture,
} from "../../keat-kube/featureResource.fixture";
import { scenario } from "./fluse";

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
