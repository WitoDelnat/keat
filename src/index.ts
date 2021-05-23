import { KeatClient, KubeClient } from "./clients";
import {
  KeatServerConfig,
  KubernetesConfig,
  DefinitionsConfig,
  StaticConfig,
} from "./config";
import { Engine, PollEngine, StaticEngine } from "./engine";
import { Definitions, definitionsSchema } from "./model/definitions";
import { createLogger } from "./utils/logger";

export { Definitions, definitionsSchema } from "./model/definitions";

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

  static async fromKubernetes<FName extends string>(
    config: KubernetesConfig<FName> = {}
  ) {
    const logger = createLogger(config.logger);
    const client = await KubeClient.fromConfig(config.path);
    const engine = new PollEngine({ ...config, client, logger });
    const keat = new Keat<FName>(engine);

    keat.engine.start();

    return keat;
  }

  static async fromKeatServer<FName extends string = string>(
    config: KeatServerConfig<FName> = {}
  ) {
    const logger = createLogger(config.logger);
    const client = new KeatClient(config.origin);
    const engine = new PollEngine({ ...config, client, logger });
    const keat = new Keat<FName>(engine);

    keat.engine.start();

    return keat;
  }

  private constructor(public readonly engine: Engine) {}

  get ready(): Promise<void> {
    return this.engine.ready;
  }

  get definitions(): Definitions {
    return this.engine.definitions();
  }

  has(name: string): boolean {
    return this.definitions.features.some((feature) => feature.name === name);
  }

  isEnabled(name: TFeatureNames, user?: string): boolean {
    const feature = this.engine.feature(name);
    return feature?.isEnabled(user) ?? false;
  }
}
