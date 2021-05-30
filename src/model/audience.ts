import { AudienceDefinition } from "./definitions";

export function createAudience(definition: AudienceDefinition): Audience {
  switch (definition.kind) {
    case "static":
      return createStaticAudience(definition);
    case "random":
      return createRandomAudience(definition);
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
