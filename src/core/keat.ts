import { mapValues } from "lodash";
import { AfterEvalHook, Plugin } from "./plugin";
import { normalizeVariateRule } from "./rules";
import type {
  Config,
  KeatInit,
  NormalizedConfig,
  RawFeatures,
  User,
} from "./types";

export class Keat<TFeatures extends RawFeatures> {
  static create<TFeatures extends RawFeatures>(
    init: KeatInit<TFeatures>
  ): Keat<TFeatures> {
    return new Keat(init);
  }

  #features: TFeatures;
  #config!: NormalizedConfig;
  #plugins: Plugin[];
  #initialized: Promise<void>;

  constructor(init: KeatInit<TFeatures>) {
    this.#features = init.features;
    this.#plugins = init.plugins ?? [];
    this.#setConfig(init.config ?? {});
    this.#initialized = this.#initialize();
  }

  async #initialize(): Promise<void> {
    for (const plugin of this.#plugins) {
      await plugin.onPluginInit?.(
        { features: this.#features },
        { setConfig: (newConfig) => this.#setConfig(newConfig) }
      );
    }
  }

  #setConfig(value: Config) {
    this.#config = mapValues(value, (r, feature) => {
      const isMultiVariate = this.#features[feature].length > 2;
      return normalizeVariateRule(r, isMultiVariate);
    });
    this.#plugins.forEach((p) => p.onConfigChange?.(this.#config));
  }

  get ready(): Promise<void> {
    return this.#initialized;
  }

  eval<TName extends keyof TFeatures>(
    name: TName,
    user?: User
  ): TFeatures[TName][number] {
    let usr = user;
    let result: unknown;
    let afterEval: AfterEvalHook[] = [];

    this.#plugins.forEach((plugin) => {
      const callback = plugin.onEval?.(
        {
          name: name as string,
          user,
          result,
        },
        {
          setResult: (newResult) => (result = newResult),
          setUser: (newUser) => (usr = newUser as User),
        }
      );
      if (callback) afterEval.push(callback);
    });

    if (!result) {
      result = this.#doEval(name as string);
    }

    afterEval.forEach((cb) => cb({ result }));
    return result;
  }

  #doEval<TName extends keyof TFeatures>(
    name: TName
  ): TFeatures[TName][number] {
    const variants = this.#features[name];
    if (!variants) return undefined;
    const rule = this.#config[name as string];
    const index = rule?.findIndex((v) => v === true) ?? -1;
    return index === -1 ? variants[rule.length - 1] : variants[index];
  }
}
