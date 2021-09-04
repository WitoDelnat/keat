import { RemoteConfig } from "../config";
import { PollingSynchronizer } from "./poll";
import { DummySynchronizer } from "./dummy";
import { Synchronizer } from "./types";
import { Engine } from "../core";

export { Synchronizer } from "./types";

export function createSynchronizer(
  config: RemoteConfig | undefined,
  engine: Engine
): Synchronizer {
  switch (config?.kind) {
    case "poll":
      return new PollingSynchronizer(config, engine);
    default:
      return new DummySynchronizer();
  }
}
