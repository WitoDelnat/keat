import { AudienceDefinition } from "./definitions";

export function createAudience(definition: AudienceDefinition): Audience {
  switch (definition.kind) {
    case "static": {
      return new StaticAudience(definition.name, definition.members);
    }
    case "random": {
      return new RandomAudience(definition.name, definition.percentage);
    }
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

export class StaticAudience implements Audience {
  constructor(public name: string, public members: string[]) {}

  isEnabled(user?: string): boolean {
    if (!user) return false;
    return this.members.some((member) => member === user);
  }
}

export class RandomAudience implements Audience {
  constructor(public name: string, public percentage: number) {}

  isEnabled(): boolean {
    return this.percentage > Math.random() * 100;
  }
}
