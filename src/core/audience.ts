import { isString, toPairs } from "lodash";
import hash from "murmurhash";
import { User } from "../config";

export const DEFAULT_SEED = 1042019;

export type Audience = {
  name: string;
  includes: (user?: User, seed?: number, userIdKey?: string) => boolean;
};

type InternalUser =
  | string
  | Record<string, string | boolean | number | undefined>;

export type DefaultAudienceName =
  | "everyone"
  | "nobody"
  | "dark-xs"
  | "dark-sm"
  | "dark-md"
  | "dark-lg"
  | "dark-xl"
  | "sticky-xs"
  | "sticky-sm"
  | "sticky-md"
  | "sticky-lg"
  | "sticky-xl";

const PERCENTAGES = {
  xs: 3,
  sm: 10,
  md: 25,
  lg: 50,
  xl: 75,
};

export const DEFAULT_AUDIENCES: Audience[] = [
  {
    name: "everyone",
    includes: () => true,
  },
  {
    name: "nobody",
    includes: () => false,
  },
  ...toPairs(PERCENTAGES).map(
    ([modifier, percentage]): Audience => ({
      name: `dark-${modifier}`,
      includes: () => percentage > Math.random() * 100,
    })
  ),
  ...toPairs(PERCENTAGES).map(
    ([modifier, percentage]): Audience => ({
      name: `sticky-${modifier}`,
      includes: (user, seed = DEFAULT_SEED, userIdKey = "id") => {
        if (!user) return false;

        const _user = user as InternalUser;
        const usr = isString(_user)
          ? _user
          : _user[userIdKey]?.toString() ?? "";

        return percentage > (hash.v3(usr, seed) % 100) + 1;
      },
    })
  ),
];
