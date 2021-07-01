import { isString, mapValues } from "lodash";
import hash from "murmurhash";
import { User } from "../config";

export const DEFAULT_SEED = 1042019;

export class Audience {
  constructor(
    public includes: (user?: User, seed?: number, userIdKey?: string) => boolean
  ) {}
}

type InternalUser =
  | string
  | Record<string, string | boolean | number | undefined>;

export type DefaultAudience =
  | "everyone"
  | "nobody"
  | keyof typeof DARK
  | keyof typeof STICKY;

const DARK = {
  "dark-xs": 3,
  "dark-sm": 10,
  "dark-md": 25,
  "dark-lg": 50,
  "dark-xl": 75,
};

const STICKY = {
  "sticky-xs": 3,
  "sticky-sm": 10,
  "sticky-md": 25,
  "sticky-lg": 50,
  "sticky-xl": 75,
};

export const DEFAULT_AUDIENCES: Record<string, Audience> = {
  everyone: new Audience(() => true),
  nobody: new Audience(() => false),
  ...mapValues(DARK, (percentage) => {
    return new Audience(() => percentage > Math.random() * 100);
  }),
  ...mapValues(STICKY, (percentage) => {
    return new Audience(
      (user?: User, seed = DEFAULT_SEED, userIdKey = "id") => {
        if (!user) return false;

        const _user = user as InternalUser;
        const usr = isString(_user)
          ? _user
          : _user[userIdKey]?.toString() ?? "";

        return percentage > (hash.v3(usr, seed) % 100) + 1;
      }
    );
  }),
};
