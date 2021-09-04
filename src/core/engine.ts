import { mapValues } from "lodash";
import hash from "murmurhash";
import { Config, User } from "../config";
import { normalise } from "../utils/fromEnv";

export type AudienceFn = (user?: User) => boolean;
export type AudienceId = number | string;
export type AudienceDefault = number | "everyone" | "nobody";

export const DEFAULT_SEED = 1042019;

export class Engine {
  private _features: Record<string, AudienceId[]> = {};
  private _audiences: Record<string, AudienceFn>;
  private _identifier: string | undefined;

  constructor(config: Config<string, string, string>) {
    this.features = config.features;
    this._audiences = {
      everyone: () => true,
      nobody: () => false,
      ...config.audiences,
    };
    this._identifier = config.identifier;
  }

  get features(): Record<string, Array<AudienceId>> {
    return this._features;
  }

  set features(
    newFeatures: Record<string, AudienceId | Array<AudienceId> | undefined>
  ) {
    this._features = {
      ...this._features,
      ...mapValues(newFeatures, normalise),
    };
  }

  isEnabled(feature: string, user?: User): boolean {
    const audiences = this.features[feature];
    if (!audiences) return false;

    return audiences.some((audience) => {
      return this.includes(feature, audience, user);
    });
  }

  private includes(feature: string, audience: string | number, user?: User) {
    return typeof audience === "number"
      ? this.rollout(feature, audience, user)
      : this._audiences[audience]?.(user) ?? false;
  }

  private rollout(feature: string, percentage: number, user?: User) {
    percentage = percentage < 0 ? 0 : percentage > 100 ? 100 : percentage;
    if (!user) return percentage > Math.random() * 100;

    const userString = this.determineUserString(user);
    const seed = hash.v3(feature, DEFAULT_SEED);
    return percentage > (hash.v3(userString, seed) % 100) + 1;
  }

  private determineUserString(
    user: string | Record<string, string | boolean | number | undefined>
  ): string {
    if (typeof user === "string") {
      return user;
    }
    if (!this._identifier) {
      return "";
    }
    return user[this._identifier]?.toString() ?? "";
  }
}
