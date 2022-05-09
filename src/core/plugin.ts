import { Config, NormalizedConfig, User } from ".";

export type Plugin = {
  /**
   * Invoked when a plugin is initialized.
   */
  onPluginInit?: OnPluginInitHook;

  /**
   * Invoked when the configuration changed.
   */
  onConfigChange?: OnConfigChangeHook;

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
};

export type OnPluginInitApi = {
  setConfig: (newConfig: Config) => void;
};

export type OnConfigChangeHook = (config: NormalizedConfig) => void;

export type OnEvalHook = (
  ctx: OnEvalCtx,
  api: OnEvalApi
) => void | AfterEvalHook;

export type OnEvalCtx = {
  feature: string;
  user: User | undefined;
  result: unknown | undefined;
};

export type OnEvalApi = {
  setResult: (newResult: unknown) => void;
  setUser: (newUser: unknown) => void;
};

export type AfterEvalHook = ({ result }: { result: unknown }) => void;
