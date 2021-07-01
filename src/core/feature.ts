import hash from "murmurhash";
import { User } from "../config";
import { Audience, DEFAULT_SEED } from "./audience";

export class Feature {
  private readonly seed: number;

  constructor(
    public readonly name: string,
    public audiences: Audience[],
    public readonly userIdKey?: string
  ) {
    this.seed = hash.v3(name, DEFAULT_SEED);
  }

  isEnabled(user?: User): boolean {
    return this.audiences.some((audience) => {
      return audience.includes(user, this.seed, this.userIdKey);
    });
  }
}
