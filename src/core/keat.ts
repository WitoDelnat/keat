import { load } from "./display";
import { AfterEvalHook } from "./plugin";
import { normalize } from "./rules";
import type { Display, KeatApi, KeatInit, AnyFeatures, User } from "./types";

export type ExtractFeatures<K> = K extends KeatApi<infer K> ? keyof K : never;

export function keat<TFeatures extends AnyFeatures>({
  features,
  config,
  display = "swap",
  plugins = [],
}: KeatInit<TFeatures>) {
  let defaultDisplay = display;
  let defaultUser: User | undefined = undefined;
  let latestId = 0;
  let latest = config;

  const loader = load(
    Promise.allSettled(
      plugins.map((plugin) =>
        plugin.onPluginInit?.(
          { features, config },
          {
            setConfig: (newConfig) => {
              latestId += 1;
              latest = newConfig;
            },
          }
        )
      )
    ).then(() => undefined)
  );

  const evaluate = (
    feature: string,
    user: User | undefined,
    configId: number
  ): any => {
    const variates = features[feature] as any[];
    if (!variates) return undefined;
    const conf = configId === 0 ? config : latest;
    const rule = normalize(conf?.[feature], variates.length > 2);
    if (!rule) return variates[variates.length - 1];

    let result: unknown;
    const afterEval: AfterEvalHook[] = [];

    for (const plugin of plugins) {
      const callback = plugin.onEval?.(
        { feature, rule, variates, user, result, configId },
        {
          setResult: (newResult) => (result = newResult),
          setUser: (newUser) => (user = newUser as User),
        }
      );
      if (typeof callback === "function") afterEval.push(callback);
      if (result !== undefined) break;
    }

    if (result === undefined) {
      const index = rule?.findIndex((v) => v === true) ?? -1;
      result = index === -1 ? variates[variates.length - 1] : variates[index];
    }

    afterEval.forEach((cb) => cb({ result }));
    return result;
  };

  return {
    ready: (display: Display = defaultDisplay) => loader.ready(display),
    setUser: (user?: User) => (defaultUser = user),
    setDisplay: (display: Display) => (defaultDisplay = display),
    variation: <TFeature extends keyof TFeatures>(
      feature: TFeature,
      user: User | undefined = defaultUser,
      display: Display = defaultDisplay
    ): TFeatures[TFeature][number] => {
      const useLatest = loader.useLatest(display);
      return evaluate(feature as string, user, useLatest ? latestId : 0);
    },
  };
}
