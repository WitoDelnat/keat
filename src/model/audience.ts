import { isString } from "lodash";
import hash from "murmurhash";
import { AudienceDefinition } from "./definitions";
import { InternalUser } from "../keat";

const MURMURHASH_SEED = 1042019;

export function createAudience(definition: AudienceDefinition): Audience {
  switch (definition.kind) {
    case "static":
      return createStaticAudience(definition);
    case "random":
      return createRandomAudience(definition);
    case "sticky":
      return createStickyAudience(definition);
  }
}

export interface Audience {
  readonly name: string;
  includes(user?: InternalUser): boolean;
}

export const NOBODY: Audience = {
  name: "nobody",
  includes: () => false,
};

export const EVERYONE: Audience = {
  name: "everyone",
  includes: () => true,
};

export function createStaticAudience(args: {
  name: string;
  members: (string | boolean | number)[];
  key?: string;
}): Audience {
  const { name, members, key = "name" } = args;

  return {
    name,
    includes(user?: InternalUser): boolean {
      if (!user) return false;

      const usr = isString(user) ? user : user[key];
      return members.some((member) => member === usr);
    },
  };
}

export function createRandomAudience(args: {
  name: string;
  percentage: number;
}): Audience {
  const { name, percentage } = args;

  return {
    name,
    includes(): boolean {
      return percentage > Math.random() * 100;
    },
  };
}

export function createStickyAudience(args: {
  name: string;
  percentage: number;
  key?: string;
}): Audience {
  const { name, percentage, key = "name" } = args;
  const seed = hash.v3(name, MURMURHASH_SEED);

  return {
    name,
    includes(user?: InternalUser): boolean {
      if (!user) return false;

      const usr = isString(user) ? user : user[key]?.toString() ?? "";
      return percentage > (hash.v3(usr, seed) % 100) + 1;
    },
  };
}
