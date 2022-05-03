import { Config, User } from "../types";

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

export type OnPluginInitHook = (api: OnPluginInitApi) => void | Promise<void>;

export type OnPluginInitApi = {
  setConfig: (newConfig: Config) => void;
};

export type OnConfigChangeHook = (config: Config) => void;

export type OnEvalHook = (
  name: string,
  user: User | undefined,
  api: OnEvalApi
) => void | AfterEvalHook;

export type OnEvalApi = {
  setResult: (newResult: unknown) => void;
  setUser: (newUser: unknown) => void;
};

export type AfterEvalHook = ({ result }: { result: unknown }) => void;
