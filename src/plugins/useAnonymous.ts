import { DEFAULT_CREATE_USER, Plugin, User } from "../core";
import { nanoid } from "nanoid";

type AnonymousPluginOptions = {
  createUser?: (id: string) => User;
  persist?: boolean;
};

export const useAnonymous = (options?: AnonymousPluginOptions): Plugin => {
  const createUser = options?.createUser ?? DEFAULT_CREATE_USER;
  let anonymousUser: unknown;

  return {
    onPluginInit() {
      let anonymousId;

      if (options?.persist) {
        anonymousId = localStorage.getItem("__keat_aid");
        if (!anonymousId) {
          anonymousId = nanoid();
          localStorage.setItem("__keat_aid", anonymousId);
        }
      } else {
        anonymousId = nanoid();
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
