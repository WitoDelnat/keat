import {
  createNopPlugin as createNoopPlugin,
  createPlugin,
  isString,
  Plugin,
} from "../core";

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
   * Whether the local storage is polled for updated.
   *
   * The default polling time every 2 seconds.
   * You can change it by setting a number (in ms).
   */
  poll?: boolean | number;
};

export const localStorage = (
  name: string,
  { key, value, poll = false }: Options = {}
) => {
  const hasLocalStorage = typeof window !== "undefined" && window.localStorage;
  const hasSetInterval = typeof window !== "undefined" && window.setInterval;
  if (!hasLocalStorage || !hasSetInterval) return createNoopPlugin();

  const pollInterval =
    poll === true ? 2000 : typeof poll === "number" && poll > 0 ? poll : 0;
  const k = key ?? name;
  let item: any;

  return createPlugin({
    onPluginInit(_, { onChange }) {
      item = window.localStorage.getItem(k);
      if (pollInterval > 0) {
        setInterval(() => {
          const newItem = window.localStorage.getItem(k);
          const hasChanged = item !== newItem;
          item = newItem;
          if (hasChanged) onChange();
        }, pollInterval);
      }
    },
    matcher: isString,
    evaluate({ literal }) {
      if (literal !== name) return false;
      return value ? item === value : Boolean(item);
    },
  });
};
