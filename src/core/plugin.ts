import { Config, User } from ".";
import { Rule } from "./types";

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
  features: Record<string, any>;
  config?: Config;
};

export type OnPluginInitApi = {
  setConfig: (newConfig: Config) => void;
  onChange: () => void;
};

export type onPreEvaluateHook = (ctx: EvalCtx, api: OnEvalApi) => void;

export type EvalCtx = {
  feature: string;
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

//////

// { OR: ["a", "b", "c", { AND: ["d", "e"] }]}
export type Matcher<T = any> = (literal: unknown) => T | null;

export type Plugin<M extends Matcher = Matcher> = {
  /**
   * Invoked when a plugin is initialized.
   */
  onPluginInit?: OnPluginInitHook;

  /**
   * Whether a literal matches this plugin.
   */
  matcher: M | M[];

  /**
   * Evaluates the matched literal.
   */
  evaluate: (ctx: EvaluateContext<InferLiteralType<M>>) => boolean;

  /**
   * Invoked when the evaluation starts.
   */
  onPreEvaluate?: onPreEvaluateHook;

  /**
   * Invoked when the evaluation ends.
   */
  onPostEvaluate?: onPostEvaluateHook;
};

type EvaluateContext<TLiteral> = EvalCtx & {
  literal: TLiteral;
};

export function createPlugin<M extends Matcher>(plugin: Plugin<M>) {
  return plugin;
}

export function createNopPlugin(): Plugin {
  return {
    matcher: (literal) => literal,
    evaluate: () => false,
  };
}

export const isBoolean: Matcher<boolean> = (literal) => {
  return typeof literal === "boolean" ? literal : null;
};

export const isString: Matcher<string> = (literal) => {
  return typeof literal === "string" ? literal : null;
};

export const isNumber: Matcher<number> = (literal) => {
  return typeof literal === "number" ? literal : null;
};

export const isDate: Matcher<Date> = (literal) => {
  const date = typeof literal === "string" ? Date.parse(literal) : NaN;
  return isNaN(date) ? new Date(date) : null;
};

type InferLiteralType<M extends Matcher<any>> = M extends Matcher<infer T>
  ? T
  : any;
