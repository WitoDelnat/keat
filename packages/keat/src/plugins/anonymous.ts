import {User} from "../types";
import {DEFAULT_CREATE_USER} from "../utils";
import {createPlugin} from "../plugin";
import {isNone} from "../matchers";

type AnonymousPluginOptions = {
  createUser?: (id: string) => User;
  createId?: () => string;
  persist?: boolean;
};

const DEFAULT_CREATE_ID = () => {
  const id = hasCrypto() ? globalThis.crypto.randomUUID() : undefined;
  return id ?? Math.floor(Math.random() * 100000000).toString();
};

export const anonymous = (options?: AnonymousPluginOptions) => {
  const createId = options?.createId ?? DEFAULT_CREATE_ID;
  const createUser = options?.createUser ?? DEFAULT_CREATE_USER;
  let anonymousUser: unknown;

  return createPlugin({
    onPluginInit() {
      let anonymousId;

      if (options?.persist && hasLocalStorage()) {
        anonymousId = localStorage.getItem("__keat_aid");
        if (!anonymousId) {
          anonymousId = createId();
          localStorage.setItem("__keat_aid", anonymousId);
        }
      } else {
        anonymousId = createId();
      }

      anonymousUser = createUser(anonymousId);
    },
    onPreEvaluate({ user }, { setUser }) {
      if (!user) {
        setUser(anonymousUser);
      }
    },
    matcher: isNone,
  });
};

function hasLocalStorage() {
  return typeof window !== "undefined" && window.localStorage;
}

function hasCrypto() {
  return typeof globalThis !== "undefined" && globalThis.crypto;
}
