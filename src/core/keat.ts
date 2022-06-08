import { load } from "./display";
import type { AfterEvalHook } from "./plugin";
import type {
  AnyFeatures,
  Config,
  Display,
  KeatApi,
  KeatInit,
  Rule,
  User,
} from "./types";
import { mutable } from "./utils";

export type ExtractFeatures<K> = K extends KeatApi<infer K> ? keyof K : never;

export function keatCore<TFeatures extends AnyFeatures>({
  features,
  display = "swap",
  plugins = [],
}: KeatInit<TFeatures>): KeatApi<TFeatures> {
  let defaultDisplay = display;
  let defaultUser: User | undefined = undefined;
  let configId = 0;
  let config: Config = {};

  const loader = load(
    Promise.allSettled(
      plugins.map((plugin) =>
        plugin.onPluginInit?.(
          { features },
          {
            setConfig: (newConfig) => {
              configId += 1;
              config = newConfig;
            },
          }
        )
      )
    ).then(() => undefined)
  );

  function getVariates(feature: string): any[] {
    const feat = features[feature];
    return typeof feat === "object" && "variates" in feat
      ? mutable(feat.variates) ?? [true, false]
      : [true, false];
  }

  const getRules = (feature: string, configId: number): Rule[] | undefined => {
    const feat = features[feature];
    const remote = config[feature];
    const local = isRule(feat) ? feat : (feat["when"] as Rule | Rule[]);
    return configId === 0 ? normalize(local) : normalize(remote ?? local);
  };

  const evaluate = (
    feature: string,
    user: User | undefined,
    configId: number
  ): any => {
    const variates = getVariates(feature);
    const rules = getRules(feature, configId);
    if (!rules) return variates[variates.length - 1];

    let result: unknown;
    const afterEval: AfterEvalHook[] = [];

    for (const plugin of plugins) {
      const callback = plugin.onEval?.(
        { feature, rules, variates, user, result, configId },
        {
          setResult: (newResult) => (result = newResult),
          setUser: (newUser) => (user = newUser as User),
        }
      );
      if (typeof callback === "function") afterEval.push(callback);
      if (result !== undefined) break;
    }

    if (result === undefined) {
      const index = rules.findIndex((v) => v === true) ?? -1;
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
    ) => {
      const useLatest = loader.useLatest(display);
      return evaluate(feature as string, user, useLatest ? configId : 0);
    },
  };
}

function normalize(rule: Rule | Rule[] | undefined): Rule[] | undefined {
  return Array.isArray(rule) ? rule : rule === undefined ? undefined : [rule];
}

function isRule(x: unknown): x is Rule {
  return (
    typeof x === "boolean" ||
    typeof x === "string" ||
    typeof x === "number" ||
    (typeof x === "object" && x !== null && "OR" in x)
  );
}
