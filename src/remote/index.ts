import { RemoteConfig } from "../config";
import { PollingSynchronizer } from "./poll";
import { DummySynchronizer } from "./dummy";
import { Synchronizer } from "./types";

export { Synchronizer } from "./types";

export function createSynchronizer(
  config: RemoteConfig | undefined
): Synchronizer {
  switch (config?.kind) {
    case "poll":
      return new PollingSynchronizer(config);
    default:
      return new DummySynchronizer();
  }
}
