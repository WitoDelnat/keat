import { load } from "./display";
import type { EvalCtx, OnEvalApi, Plugin } from "./plugin";
import type {
  AnyFeatures,
  Config,
  Display,
  KeatApi,
  KeatInit,
  Rule,
  User,
} from "./types";
import { getRules, getVariatesMap, isLiteral } from "./utils";

export type ExtractFeatures<K> = K extends KeatApi<infer K> ? keyof K : never;

export type Listener = (config?: Config) => void;
export type Unsubscribe = () => void;

export function keatCore<TFeatures extends AnyFeatures>({
  features,
  display = "swap",
  plugins = [],
}: KeatInit<TFeatures>): KeatApi<TFeatures> {
  const names = Object.keys(features);
  const variatesMap = getVariatesMap(features);
  let defaultDisplay = display;
  let defaultUser: User | undefined = undefined;

  let configId = 0;
  let config: Config = {};
  const setConfig = (newConfig: Config) => {
    configId += 1;
    config = newConfig ?? {};
  };

  let listeners: Listener[] = [];
  const handleChange = () => {
    listeners.forEach((l) => l(config));
  };

  const initPromise = Promise.allSettled(
    plugins.map((p) =>
      p.onPluginInit?.(
        { features: names, variates: variatesMap },
        {
          setConfig,
          onChange: handleChange,
        }
      )
    )
  ).then(() => {
    if (configId === 0) return;
    handleChange();
  });

  let loader = load(initPromise);

  const evaluate = (
    feature: string,
    user: User | undefined,
    configId: number
  ): any => {
    const variates = variatesMap[feature];
    const rules = getRules(features, config, feature, configId);
    if (!rules) return variates[variates.length - 1];

    let result: unknown;
    let ctx: EvalCtx = {
      feature,
      variates,
      rules,
      user,
      configId,
    };

    const preApi: OnEvalApi = {
      setUser: (newUser) => {
        ctx.user = newUser as User;
      },
    };

    plugins.forEach((p) => p.onPreEvaluate?.(ctx, preApi));

    for (let i = 0; i < variates.length; i++) {
      const variate = variates[i];
      const rule = rules[i];
      const ok = evaluateVariate({ ...ctx, variate }, plugins, rule);

      if (ok) {
        result = variate;
        break;
      }
    }

    if (result === undefined) {
      const index = rules.findIndex((v) => v === true) ?? -1;
      result = index === -1 ? variates[variates.length - 1] : variates[index];
    }

    plugins.forEach((p) => p.onPostEvaluate?.({ ...ctx, result }));

    return result;
  };

  return {
    ready: (display: Display = defaultDisplay) => loader.ready(display),
    configure: (newConfig: Config) => {
      setConfig(newConfig);
      handleChange();
    },
    identify: (user?: User, noReload?: boolean) => {
      defaultUser = user;
      plugins.forEach((p) => p.onIdentify);
      if (noReload) return;
      const currentId = configId;
      loader = load(
        Promise.allSettled(plugins.map((p) => p.onIdentify?.({ user }))).then(
          () => {
            if (configId === currentId) return;
            handleChange();
          }
        )
      );
    },
    setDisplay: (display: Display) => (defaultDisplay = display),
    variation: <TFeature extends keyof TFeatures>(
      feature: TFeature,
      user: User | undefined = defaultUser,
      display: Display = defaultDisplay
    ) => {
      const useLatest = loader.useLatest(display);
      return evaluate(feature as string, user, useLatest ? configId : 0);
    },
    onChange: (listener: Listener): Unsubscribe => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter((l) => l === listener);
      };
    },
  };
}

function evaluateVariate(
  ctx: EvalCtx,
  plugins: Plugin<any>[],
  rule: Rule | undefined
): boolean {
  if (rule === undefined) return false;
  return isLiteral(rule)
    ? plugins.some((p) => {
        const matchers = Array.isArray(p.matcher) ? p.matcher : [p.matcher];
        for (const matcher of matchers) {
          const literal = matcher(rule);
          if (literal === null) continue;
          return p.evaluate?.({ ...ctx, literal }) ?? false;
        }
      })
    : rule.OR.some((r) => evaluateVariate(ctx, plugins, r));
}
