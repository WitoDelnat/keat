import { Definitions } from "./definitions";
import { fixture } from "../utils/testing/fluse";

type Args = Partial<Definitions>;

export const definitionsFixture = fixture<Definitions, Args>({
  create: (_, args) => {
    return {
      features: args.features ?? [],
      audiences: args.audiences ?? [],
    };
  },
});
