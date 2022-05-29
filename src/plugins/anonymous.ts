import { DEFAULT_CREATE_USER, Plugin, User } from "../core";

type AnonymousPluginOptions = {
  createUser?: (id: string) => User;
  persist?: boolean;
};

export const anonymous = (options?: AnonymousPluginOptions): Plugin => {
  const createUser = options?.createUser ?? DEFAULT_CREATE_USER;
  let anonymousUser: unknown;

  return {
    onPluginInit() {
      let anonymousId;

      if (options?.persist && hasLocalStorage()) {
        anonymousId = localStorage.getItem("__keat_aid");
        if (!anonymousId) {
          anonymousId = crypto.randomUUID();
          localStorage.setItem("__keat_aid", anonymousId);
        }
      } else {
        anonymousId = crypto.randomUUID();
      }

      anonymousUser = createUser(anonymousId);
    },
    onEval({ user }, { setUser }) {
      if (!user) {
        setUser(anonymousUser);
      }
    },
  };
};

function hasLocalStorage() {
  return typeof window !== "undefined" && window.localStorage;
}
