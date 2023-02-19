import { load } from "./display";
import type {
  EvalCtx,
  OnEvalApi,
  OnPluginInitApi,
  onPostEvaluateHook,
  Plugin,
} from "./plugin";
import type {
  AnyFeatures,
  Config,
  Display,
  KeatApi,
  KeatInit,
  Literal,
  Rule,
  User,
} from "./types";
import { mutable } from "./utils";

export type ExtractFeatures<K> = K extends KeatApi<infer K> ? keyof K : never;

export type Listener = () => void;
export type Unsubscribe = () => void;

export function keatCore<TFeatures extends AnyFeatures>({
  features,
  display = "swap",
  plugins = [],
}: KeatInit<TFeatures>): KeatApi<TFeatures> {
  let listeners: Listener[] = [];
  let defaultDisplay = display;
  let defaultUser: User | undefined = undefined;
  let configId = 0;
  let config: Config = {};

  const initApi: OnPluginInitApi = {
    setConfig: (newConfig) => {
      configId += 1;
      config = newConfig;
    },
    onChange: () => {
      listeners.forEach((l) => l());
    },
  };

  const loader = load(
    Promise.allSettled(
      plugins.map((p) => p.onPluginInit?.({ features }, initApi))
    )
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
    identify: (user?: User) => {
      defaultUser = user;
      plugins.forEach(p => p.onIdentify)
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

function evaluateVariate(ctx: EvalCtx, plugins: Plugin[], rule: Rule): boolean {
  return isLiteral(rule)
    ? plugins.some((p) => {
        const matchers = Array.isArray(p.matcher) ? p.matcher : [p.matcher];
        for (const matcher of matchers) {
          const literal = matcher(rule);
          if (literal === null) continue;
          return p.evaluate({ ...ctx, literal });
        }
      })
    : rule.OR.some((r) => evaluateVariate(ctx, plugins, r));
}

function isLiteral(rule: Rule): rule is Literal {
  const t = typeof rule;
  return t === "string" || t === "number" || t === "boolean";
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
