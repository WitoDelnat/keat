import { Plugin, takeStrings } from "../core";

type Options = {
  /**
   * The key of the URL's query parameter.
   *
   * Defaults to the `name`.
   */
  key?: string;

  /**
   * The value that belongs to the key of the URL's query parameter.
   *
   * Defaults to a `has` check.
   */
  value?: string;
};

/**
 * Toggles features based on the URL's query parameter.
 */
export const queryParam = (
  name: string,
  { key, value }: Options = {}
): Plugin => {
  return {
    onEval({ variates, rules }, { setResult }) {
      if (typeof window === "undefined") return;

      const index = rules.findIndex((rule) =>
        takeStrings(rule).some((r) => {
          if (r !== name) return false;
          const queryString = window.location.search;
          const params = new URLSearchParams(queryString);
          return value
            ? params.get(key ?? name) === value
            : params.has(key ?? name);
        })
      );

      if (index !== -1) setResult(variates[index]);
    },
  };
};
