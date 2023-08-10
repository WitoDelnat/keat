import { isNone, Matcher } from "./matchers";
import {Config, Rule, User} from "./types";

export type LegacyPlugin = {
  /**
   * Invoked when a plugin is initialized.
   */
  onPluginInit?: OnPluginInitHook;

  /**
   * Invoked when a flag is evaluated.
   */
  onEval?: onPreEvaluateHook;
};

export type OnPluginInitHook = (
  ctx: OnPluginInitCtx,
  api: OnPluginInitApi
) => void | Promise<void>;

export type OnPluginInitCtx = {
  features: string[];
  variates: Record<string, any[]>;
  config?: Config;
};

export type OnPluginInitApi = {
  setConfig: (newConfig: Config) => void;
  onChange: () => void;
};

export type OnPluginIdentifyHook = (
  ctx: OnPluginIdentifyCtx
) => void | Promise<void>;

export type OnPluginIdentifyCtx = {
  user?: User;
};

export type onPreEvaluateHook = (ctx: EvalCtx, api: OnEvalApi) => void;

export type EvalCtx = {
  feature: string;
  variate?: any;
  variates: any[];
  rules: Rule[];
  user: User | undefined;
  configId: number;
};

export type PostEvalCtx = EvalCtx & { result: unknown };

export type OnEvalApi = {
  setUser: (newUser: unknown) => void;
};

export type onPostEvaluateHook = (ctx: EvalCtx & { result: unknown }) => void;

export type Plugin<M extends Matcher> = {
  /**
   * Invoked when a plugin is initialized.
   */
  onPluginInit?: OnPluginInitHook;

  /**
   * Invoked when a user is identifier.
   */
  onIdentify?: OnPluginIdentifyHook;

  /**
   * Invoked when the evaluation starts.
   */
  onPreEvaluate?: onPreEvaluateHook;

  /**
   * Invoked when the evaluation ends.
   */
  onPostEvaluate?: onPostEvaluateHook;

  /**
   * Whether a literal matches this plugin.
   *
   * The matcher decides whether `evaluate` is invoked, Use `isNone` to skip evaluation.
   *
   * @remark Consider a helper: `isNone`, `isAny`, `isBoolean`, `isString`, `isNumber` or `isDate`.
   */
  matcher: M | M[];

  /**
   * Evaluates the matched literal.
   *
   * @remark The matcher infers the type of your literal.
   */
  evaluate?: (ctx: EvaluateContext<InferLiteralType<M>>) => boolean;
};

type EvaluateContext<TLiteral> = EvalCtx & {
  literal: TLiteral;
};

type InferLiteralType<M extends Matcher<any>> = M extends Matcher<infer T>
  ? T
  : any;

export function createPlugin<M extends Matcher>(plugin: Plugin<M>) {
  return plugin;
}

export function createNopPlugin(): Plugin<Matcher<void>> {
  return {
    matcher: isNone,
  };
}
