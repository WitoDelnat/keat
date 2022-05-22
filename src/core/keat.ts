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
  #latest: Config | undefined;
  #configId: number = 0;
  #plugins: Plugin[];
  #display: Display;
  #defaultDisplay: FeatureDisplay;

  constructor(init: KeatInit<TFeatures>) {
    this.#features = init.features;
    this.#fallback = init.config;
    this.#latest = init.config;
    this.#defaultDisplay = init.display ?? "swap";
    this.#plugins = init.plugins ?? [];
    this.#display = new Display(this.#initialize(init.config));
  }

  #initialize = async (config: Config = {}): Promise<void> => {
    await Promise.all(
      this.#plugins.map((plugin) => {
        return plugin.onPluginInit?.(
          { features: this.#features, config },
          {
            setConfig: (newConfig) => {
              this.#configId += 1;
              this.#latest = newConfig;
            },
          }
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
    const useLatest = this.#display.useLatest(display);
    if (useLatest === undefined) {
      const msg = `[keat] Using fallback because '${display}' is not ready. You should await keat.ready to avoid unexpected behavior.`;
      console.warn(msg);
    }
    const configId = useLatest ? this.#configId : 0;
    return this.#doEvaluate(feature as string, user, configId);
  };

  #doEvaluate(feature: string, user: User | undefined, configId: number): any {
    const variates = this.#features[feature] as any[];
    if (!variates) return undefined;
    const config = configId === 0 ? this.#fallback : this.#latest;
    const rule = normalize(config?.[feature], variates.length > 2);
    if (!rule) return variates[variates.length - 1];

    let result: unknown;
    let afterEval: AfterEvalHook[] = [];

    this.#plugins.forEach((plugin) => {
      const callback = plugin.onEval?.(
        { feature, rule, variates, user, result, configId },
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
