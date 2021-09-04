import { RemoteConfig } from "../config";
import { PollingSynchronizer } from "./poll";
import { DummySynchronizer } from "./dummy";
import { Synchronizer } from "./types";
import { Engine } from "../core";
import { KeatSynchronizer } from "./keat";

export { Synchronizer } from "./types";

export function createSynchronizer(
  config: RemoteConfig | undefined,
  engine: Engine
): Synchronizer {
  switch (config?.kind) {
    case "poll":
      return new PollingSynchronizer(config, engine);
    case "keat":
      return new KeatSynchronizer(config, engine);
    default:
      return new DummySynchronizer();
  }
}
