import { createPlugin, isString, Plugin, takeStrings } from "../core";

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

export const queryParam = (name: string, { key, value }: Options = {}) => {
  return createPlugin({
    matcher: isString,
    evaluate({ literal }) {
      if (literal !== name || typeof window === "undefined") return false;

      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);

      return value
        ? params.get(key ?? name) === value
        : params.has(key ?? name);
    },
  });
};
