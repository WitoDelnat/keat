import { Config, User } from ".";
import { NormalizedRule } from "./types";

export type Plugin = {
  /**
   * Invoked when a plugin is initialized.
   */
  onPluginInit?: OnPluginInitHook;

  /**
   * Invoked when a flag is evaluated.
   */
  onEval?: OnEvalHook;
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
};

export type OnEvalHook = (
  ctx: OnEvalCtx,
  api: OnEvalApi
) => void | AfterEvalHook;

export type OnEvalCtx = {
  feature: string;
  variates: any[];
  rule: NormalizedRule;
  user: User | undefined;
  configId: number;
  result: unknown | undefined;
};

export type OnEvalApi = {
  setResult: (newResult: unknown) => void;
  setUser: (newUser: unknown) => void;
};

export type AfterEvalHook = ({ result }: { result: unknown }) => void;
