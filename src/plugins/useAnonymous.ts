import { User } from "../types";
import { Plugin } from "./plugin";
import { nanoid } from "nanoid";

type AnonymousPluginOptions = {
  persist?: boolean;
};

export const useAnonymous = (options?: AnonymousPluginOptions): Plugin => {
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

  const anonymousUser: User = { sub: anonymousId };

  return {
    onEval: (_name, user, { setUser }) => {
      if (!user) {
        setUser(anonymousUser);
      }
    },
  };
};
