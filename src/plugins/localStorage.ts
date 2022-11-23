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
): Plugin => {
  const k = key ?? name;
  let item = window.localStorage.getItem(k);

  return {
    onPluginInit(_, { onChange }) {
      const pollInterval =
        poll === true ? 2000 : typeof poll === "number" && poll > 0 ? poll : 0;
      if (hasSetInterval() && pollInterval > 0) {
        setInterval(() => {
          const newItem = window.localStorage.getItem(k);
          const hasChanged = item !== newItem;
          item = newItem;
          if (hasChanged) onChange();
        }, pollInterval);
      }
    },
    onEval({ variates, rules }, { setResult }) {
      if (typeof window === "undefined") return;

      const index = rules.findIndex((rule) =>
        takeStrings(rule).some((r) => {
          if (r !== name) return false;
          return value ? item === value : Boolean(item);
        })
      );

      if (index !== -1) setResult(variates[index]);
    },
  };
};

function hasSetInterval() {
  return typeof window !== "undefined" && window.setInterval;
}
