import { Plugin, takeStrings } from "../core";

type Options = {
  /**
   * The key of the local storage entry.
   *
   * Defaults to the `name`.
   */
  key?: string;

  /**
   * The value that's expected for the local storage entry.
   *
   * Defaults to a `has` check.
   */
  value?: string;

  /**
   * Whether the local storage item should only
   * retried at initialisation.
   *
   * @default false
   */
  once?: boolean;
};

export const localStorage = (
  name: string,
  { key, value, once = false }: Options = {}
): Plugin => {
  const item = once ?? window.localStorage.getItem(key ?? name);
  return {
    onEval({ variates, rules }, { setResult }) {
      if (typeof window === "undefined") return;

      const index = rules.findIndex((rule) =>
        takeStrings(rule).some((r) => {
          if (r !== name) return false;
          const i = once ? item : window.localStorage.getItem(key ?? name);
          return value ? i === value : Boolean(i);
        })
      );

      if (index !== -1) setResult(variates[index]);
    },
  };
};
