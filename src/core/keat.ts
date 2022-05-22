import { Display } from "./display";
import { AfterEvalHook, Plugin } from "./plugin";
import { normalize } from "./rules";
import type {
  Config,
  FeatureDisplay,
  KeatInit,
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
  #fallback: Config | undefined;
  #remote: Config | undefined;
  #plugins: Plugin[];
  #display: Display;
  #defaultDisplay: FeatureDisplay;

  constructor(init: KeatInit<TFeatures>) {
    this.#features = init.features;
    this.#fallback = init.config;
    this.#remote = init.config;
    this.#defaultDisplay = init.display ?? "swap";
    this.#plugins = init.plugins ?? [];
    this.#display = new Display(this.#initialize(init.config));
  }

  #initialize = async (config: Config = {}): Promise<void> => {
    await Promise.all(
      this.#plugins.map((plugin) => {
        return plugin.onPluginInit?.(
          { features: this.#features, config },
          { setConfig: (newConfig) => (this.#remote = newConfig) }
        );
      })
    );
  };

  ready = (display: FeatureDisplay = this.#defaultDisplay): Promise<void> => {
    return this.#display.ready(display);
  };

  variation = <TFeature extends keyof TFeatures>(
    feature: TFeature,
    user?: User,
    display: FeatureDisplay = this.#defaultDisplay
  ): TFeatures[TFeature][number] => {
    const result = this.#display.evaluate(display);
    if (!result) {
      const msg = `[keat] Using fallback because '${display}' is not ready. You should await keat.ready to avoid unexpected behavior.`;
      console.warn(msg);
    }
    const config = result === "remote" ? this.#remote : this.#fallback;
    return this.#doEvaluate(feature as string, user, config);
  };

  #doEvaluate(feature: string, user?: User, config?: Config): any {
    const variates = this.#features[feature] as any[];
    if (!variates) return undefined;
    const rule = normalize(config?.[feature], variates.length > 2);
    if (!rule) return variates[variates.length - 1];

    let result: unknown;
    let afterEval: AfterEvalHook[] = [];

    this.#plugins.forEach((plugin) => {
      const callback = plugin.onEval?.(
        { feature, rule, variates, user, result },
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
      const index = rule?.findIndex((v) => v === true) ?? -1;
      result = index === -1 ? variates[variates.length - 1] : variates[index];
    }

    afterEval.forEach((cb) => cb({ result }));
    return result;
  }
}
