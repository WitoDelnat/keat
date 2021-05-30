import { Definitions } from "../model/definitions";
import { fixture } from "./fluse";

type Args = Partial<Definitions>;

export const definitionsFixture = fixture<Definitions, Args>({
  create: (_, args) => {
    return {
      features: args.features ?? [],
      audiences: args.audiences ?? [],
    };
  },
});
