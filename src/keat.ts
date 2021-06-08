import { KeatClient, KubeClient } from "./clients";
import {
  DefinitionsConfig,
  KeatServerConfig,
  KubernetesConfig,
  StaticConfig,
} from "./config";
import { Engine, PollEngine, StaticEngine } from "./engine";
import { Definitions, definitionsSchema } from "./model/definitions";
import { LabelSelectors } from "./model/labels";
import { createLogger } from "./utils/logger";

/**
 * Bring your own user with declaration merging:
 *
 * @example
 * ```
 * declare module 'keat-node' {
 *   interface KeatNode {
 *     user: { name: string, email: string }
 *   }
 * }
 * ```
 *
 * @remark Currently only Record<string, string | boolean | number> is allowed.
 */
export interface KeatNode {
  // user: ...
}

export type User = KeatNode extends { user: infer T } ? T : string;
export type UserKey = User extends string ? {} : { key: keyof User };
export type InternalUser =
  | string
  | Record<string, string | boolean | number | undefined>;

export class Keat<TFeatureNames extends string = string> {
  static create<
    FName extends string,
    AName extends ANames,
    ANames extends string
  >(config: StaticConfig<FName, AName, ANames>): Keat<FName> {
    const definitions = {
      features: config.features,
      audiences: config.audiences,
    };
    return Keat.fromDefinitions({ definitions, logger: config.logger });
  }

  static fromDefinitions<FName extends string>(
    config: DefinitionsConfig<FName>
  ): Keat<FName> {
    const logger = createLogger(config.logger);
    const definitions = definitionsSchema.parse(config.definitions);
    const engine = new StaticEngine(definitions, logger);
    const keat = new Keat<FName>(engine);

    keat.engine.start();

    return keat;
  }

  static fromKeatServer<FName extends string = string>(
    config: KeatServerConfig<FName> = {}
  ) {
    const logger = createLogger(config.logger);
    const client = new KeatClient(config.origin);
    const engine = new PollEngine({ ...config, client, logger });
    const keat = new Keat<FName>(engine);

    keat.engine.start();

    return keat;
  }

  static fromKubernetes<FName extends string>(
    config: KubernetesConfig<FName> = {}
  ) {
    const logger = createLogger(config.logger);
    const client = KubeClient.fromConfig(config.path);
    const engine = new PollEngine({ ...config, client, logger });
    const keat = new Keat<FName>(engine);

    keat.engine.start();

    return keat;
  }

  private constructor(public readonly engine: Engine) {}

  /**
   * Resolves when the first definitions have been set.
   */
  get ready(): Promise<void> {
    return this.engine.ready;
  }

  /**
   * Returns the current definitions.
   */
  get definitions(): Definitions {
    return this.engine.definitions();
  }

  /**
   * Returns a list of strings of features enabled for the given user.
   * Add label selectors to filter the feature set.
   *
   * @example keat.getFor(user, { app: 'frontend' });
   */
  getFor(user: User, labels?: LabelSelectors): string[] {
    return this.engine
      .features()
      .filter((feature) => feature.match(labels))
      .filter((feature) => feature.isEnabled(user))
      .map((feature) => feature.name);
  }

  /**
   * Whether a feature with given name exists.
   */
  has(name: string): boolean {
    return this.definitions.features.some((feature) => feature.name === name);
  }

  /**
   * Whether the feature is enabled for the given user.
   */
  isEnabled(name: TFeatureNames, user?: User): boolean {
    const feature = this.engine.feature(name);
    return feature?.isEnabled(user) ?? false;
  }
}
