import { nanoid } from "nanoid";
import { Plugin } from "./plugin";

type AnonymousPluginOptions = {
  persist?: boolean;
};

export const useAnonymous = (options?: AnonymousPluginOptions): Plugin => {
  let anonymousUser: unknown;

  return {
    onPluginInit({ userIdentifier }) {
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

      anonymousUser = { [userIdentifier]: anonymousId };
    },
    onEval(_name, user, { setUser }) {
      if (!user) {
        setUser(anonymousUser);
      }
    },
  };
};
