import { keyBy, toPairs } from "lodash";
import { Config, RemoteData, User } from "../config";
import { Synchronizer } from "../remote";
import { fromEnv, normalise } from "../utils/fromEnv";
import { isDefined } from "../utils/types";
import { Audience, DEFAULT_AUDIENCES } from "./audience";
import { Feature } from "./feature";

export class Engine {
  private featureList: Feature[] = [];
  private features: Record<string, Feature> = {};
  private audiences: Record<string, Audience> = {};

  constructor(
    readonly config: Config<string, string, string>,
    readonly remote: Synchronizer
  ) {
    this.bootstrap(config);
    this.remote.onChange = (data) => this.onRemoteConfigChanged(data);
  }

  getFeaturesFor(user: User): string[] {
    return this.featureList
      .filter((feature) => feature.isEnabled(user))
      .map((feature) => feature.name);
  }

  isEnabled(feature: string, user?: User): boolean {
    return this.features[feature].isEnabled(user) ?? false;
  }

  private bootstrap(config: Config<string, string, string>) {
    const customAudiences = config.audiences ?? [];
    const aMap = keyBy([...DEFAULT_AUDIENCES, ...customAudiences], "name");

    const features = config.features.map(({ name, audience, seed }) => {
      const audiences = normalise(audience)
        .map((a) => aMap[a])
        .filter(isDefined);
      return new Feature(name, audiences, seed, config.userConfig?.idKey);
    });
    const fMap = keyBy(features, "name");

    this.audiences = aMap;
    this.features = fMap;
    this.featureList = features;
  }

  private onRemoteConfigChanged = (data: RemoteData) => {
    toPairs(data).forEach(([name, audience]) => {
      const feature = this.features[name];
      if (!feature) return;
      feature.audiences = fromEnv(audience)
        .map((aName) => this.audiences[aName])
        .filter(isDefined);
    });
  };
}
