import { AfterEvalHook, Plugin } from "./plugin";
import { normalizeVariateRule } from "./rules";
import type {
  Config,
  KeatInit,
  NormalizedConfig,
  RawFeatures,
  User,
} from "./types";

/**
 * Type utility which extracts all features.
 *
 * @example `type Feature = ExtractFeatures<typeof keat>;`
 */
export type ExtractFeatures<K> = K extends Keat<infer K> ? keyof K : never;

export class Keat<TFeatures extends RawFeatures> {
  static create<TFeatures extends RawFeatures>(
    init: KeatInit<TFeatures>
  ): Keat<TFeatures> {
    return new Keat(init);
  }

  #features: TFeatures;
  #config!: NormalizedConfig;
  #plugins: Plugin[];
  #ready: Promise<void>;
  #initialized = false;

  constructor(init: KeatInit<TFeatures>) {
    this.#features = init.features;
    this.#plugins = init.plugins ?? [];
    this.#ready = this.#initialize(init.config ?? {});
  }

  /**
   * Goal:
   * - Without remote config, Keat is immediately ready without an async tick.
   * - With remote config, it must work properly without awaiting ready.
   * - With remote config, it should be awaitable to avoid feature flash.
   * - Background processes can keep updating config post-initialization.
   *
   * 1. Execute all sync plugins.
   * 2. Set final sync configuration.
   * -- Keat works now with default config
   * 3. Await all async plugins.
   * 4. Set final async configuration only if modified
   * -- Ready. Keat works now with remote config
   * 5. Background plugin can keep using setConfig.
   */
  async #initialize(config: Config): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const plugin of this.#plugins) {
      const result = plugin.onPluginInit?.(
        { features: this.#features, config },
        {
          setConfig: (newConfig) => {
            if (this.#initialized) {
              this.#setConfig(newConfig);
            } else {
              config = newConfig;
            }
          },
        }
      );
      if (isPromise(result)) promises.push(result);
    }

    const syncConfig = config;
    this.#setConfig(config);
    await Promise.all(promises);
    if (config !== syncConfig) this.#setConfig(config);
    this.#initialized = true;
  }

  #setConfig(value: Config) {
    this.#config = Object.fromEntries(
      Object.entries(value).map(([feature, rule]) => {
        const isMultiVariate = this.#features[feature].length > 2;
        return [feature, normalizeVariateRule(rule, isMultiVariate)];
      })
    );

    this.#plugins.forEach((p) => p.onConfigChange?.(this.#config));
  }

  get ready(): Promise<void> {
    return this.#ready;
  }

  eval<TFeature extends keyof TFeatures>(
    feature: TFeature,
    user?: User
  ): TFeatures[TFeature][number] {
    let result: unknown;
    let afterEval: AfterEvalHook[] = [];

    this.#plugins.forEach((plugin) => {
      const callback = plugin.onEval?.(
        {
          feature: feature as string,
          user,
          result,
        },
        {
          setResult: (newResult) => {
            result = newResult;
          },
          setUser: (newUser) => {
            user = newUser as User;
          },
        }
      );
      if (callback) afterEval.push(callback);
    });

    if (!result) {
      result = this.#doEval(feature as string);
    }

    afterEval.forEach((cb) => cb({ result }));
    return result;
  }

  #doEval<TFeature extends keyof TFeatures>(
    feature: TFeature
  ): TFeatures[TFeature][number] {
    const variants = this.#features[feature];
    if (!variants) return undefined;
    const rule = this.#config[feature as string];
    const index = rule?.findIndex((v) => v === true) ?? -1;
    return index === -1 ? variants[variants.length - 1] : variants[index];
  }
}

const isPromise = (v: unknown): v is Promise<void> =>
  typeof v === "object" && typeof (v as any).then === "function";
