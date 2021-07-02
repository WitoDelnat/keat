import { mapValues, toPairs } from "lodash";
import { Config, RemoteData, User } from "../config";
import { Synchronizer } from "../remote";
import { normalise } from "../utils/fromEnv";
import { isDefined } from "../utils/types";
import { Audience, DEFAULT_AUDIENCES } from "./audience";
import { Feature } from "./feature";

export class Engine {
  private features: Record<string, Feature> = {};
  private audiences: Record<string, Audience> = {};

  constructor(
    readonly config: Config<string, string, string>,
    readonly remote: Synchronizer
  ) {
    this.bootstrap(config);
    this.remote.onChange = (data) => this.onRemoteConfigChanged(data);
  }

  snapshot(user: User): Record<string, boolean> {
    return mapValues(this.features, (feature) => feature.isEnabled(user));
  }

  isEnabled(feature: string, user?: User): boolean {
    return this.features[feature]?.isEnabled(user) ?? false;
  }

  private bootstrap(config: Config<string, string, string>) {
    this.audiences = {
      ...DEFAULT_AUDIENCES,
      ...mapValues(config.audiences, (a) => new Audience(a)),
    };
    this.features = mapValues(config.features, (audience, name) => {
      const audiences = this.mapToAudiences(audience);
      return new Feature(name, audiences, config.userConfig?.idKey);
    });
  }

  private onRemoteConfigChanged = (data: RemoteData) => {
    toPairs(data).forEach(([name, audience]) => {
      const feature = this.features[name];
      if (!feature) return;
      feature.audiences = this.mapToAudiences(audience);
    });
  };

  private mapToAudiences(audience: string | string[] | undefined): Audience[] {
    return normalise(audience)
      .map((aName) => this.audiences[aName])
      .filter(isDefined);
  }
}
