import { AudienceDefinition } from "./definitions";
import hash from "murmurhash";

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
  isEnabled(user?: string): boolean;
}

export const NOBODY: Audience = {
  name: "nobody",
  isEnabled: () => false,
};

export const EVERYONE: Audience = {
  name: "everyone",
  isEnabled: () => true,
};

export function createStaticAudience(args: {
  name: string;
  members: string[];
}): Audience {
  const { name, members } = args;

  return {
    name,
    isEnabled(user?: string): boolean {
      if (!user) return false;
      return members.some((member) => member === user);
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
    isEnabled(): boolean {
      return percentage > Math.random() * 100;
    },
  };
}

export function createStickyAudience(args: {
  name: string;
  percentage: number;
}): Audience {
  const { name, percentage } = args;
  const seed = hash.v3(name, MURMURHASH_SEED);

  return {
    name,
    isEnabled(user?: string): boolean {
      if (!user) return false;
      return percentage > (hash.v3(user, seed) % 100) + 1;
    },
  };
}
