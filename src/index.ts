import { Config, User } from "./config";
import { Engine } from "./core";
import { createSynchronizer, Synchronizer } from "./remote";

export { KeatNode } from "./config";
export { fromEnv } from "./utils/fromEnv";

export type ExtractFeatures<K> = K extends Keat<infer K> ? K : never;

export class Keat<TFeatureNames extends string = string> {
  static create<
    FName extends string,
    AName extends ANames,
    ANames extends string
  >(init: Config<FName, AName, ANames>): Keat<FName> {
    const config = {
      audiences: init.audiences ?? [],
      features: init.features,
    };
    const remote = createSynchronizer(init.remoteConfig);
    const engine = new Engine(config, remote);
    const keat = new Keat<FName>(engine, remote);

    keat.start();

    return keat;
  }

  private constructor(
    private readonly engine: Engine,
    private readonly remoteConfig: Synchronizer
  ) {}

  /**
   * Resolves when the first remote configuration is fetched.
   */
  get ready(): Promise<void> {
    return this.remoteConfig.ready;
  }

  /**
   * Starts remote configuration synchronization.
   */
  start(): void {
    return this.remoteConfig.start();
  }

  /**
   * Stops remote configuration synchronization.
   */
  stop(): Promise<void> {
    return this.remoteConfig.stop();
  }

  /**
   * Whether the feature is enabled for a user.
   */
  isEnabled(name: TFeatureNames, user?: User): boolean {
    return this.engine.isEnabled(name, user);
  }

  /**
   * Returns all enabled features for given user.
   */
  getFeaturesFor(user: User): string[] {
    return this.engine.getFeaturesFor(user);
  }
}
