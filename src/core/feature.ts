import { User } from "../config";
import { Audience, DEFAULT_SEED } from "./audience";
import hash from "murmurhash";

export class Feature {
  constructor(
    public readonly name: string,
    public audiences: Audience[],
    public readonly seed: number = hash.v3(name, DEFAULT_SEED),
    public readonly userIdKey?: string
  ) {}

  isEnabled(user?: User): boolean {
    return this.audiences.some((audience) => {
      return audience.includes(user, this.seed, this.userIdKey);
    });
  }
}
