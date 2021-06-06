import { keyBy, values } from "lodash";
import { BaseLogger, Logger } from "pino";
import { Audience, createAudience, EVERYONE, NOBODY } from "../model/audience";
import { Definitions, FeatureDefinition } from "../model/definitions";
import { Feature } from "../model/feature";
import { Signal } from "../utils/signal";
import { Engine } from "./interface";

export abstract class AbstractEngine implements Engine {
  private _definitions: Definitions = { audiences: [], features: [] };
  private _features: Record<string, Feature> = {};
  private _strict: string[] | undefined;
  protected _ready: Signal = new Signal();
  protected _logger: BaseLogger;

  constructor(logger: Logger, strict?: string[]) {
    this._strict = strict;
    this._logger = logger;
  }

  abstract start(): void;
  abstract stop(): Promise<void>;

  get ready() {
    return this._ready.promise;
  }

  feature(name: string): Feature | undefined {
    return this._features[name];
  }

  features(): Feature[] {
    return values(this._features);
  }

  definitions(): Definitions {
    return this._definitions;
  }

  protected set(definitions: Definitions) {
    this.checkFeaturesStrict(definitions.features);
    this._definitions = definitions;

    const audiences = [
      EVERYONE,
      NOBODY,
      ...(definitions.audiences?.map(createAudience) ?? []),
    ];

    const features = definitions.features.map((featureDefinitions) => {
      if (!featureDefinitions.audiences) {
        return new Feature({
          ...featureDefinitions,
          audiences: undefined,
        });
      }

      const featureAudiences = audiences.filter((audience) => {
        return featureDefinitions.audiences?.includes(audience.name) ?? false;
      });

      this.checkAudiences(featureDefinitions, featureAudiences);

      return new Feature({
        ...featureDefinitions,
        audiences: featureAudiences,
      });
    });

    this._features = keyBy(features, "name");
    this._ready.resolve();
  }

  private checkFeaturesStrict(features: FeatureDefinition[]): void {
    if (!this._strict) return;

    const expectedFeatures = this._strict;
    const hasAllExpectedFeatures = expectedFeatures.every((expectedFeature) => {
      return features.some((feature) => expectedFeature === feature.name);
    });

    if (!hasAllExpectedFeatures) {
      this._logger.warn(
        {
          actual: features.map((feature) => feature.name),
          expected: expectedFeatures,
        },
        "strict check failed: not all expected features were found"
      );
    }
  }

  private checkAudiences(
    feature: FeatureDefinition,
    audiences: Audience[]
  ): void {
    if (!feature.audiences) return;

    const hasAllExpectedAudiences =
      feature.audiences.length === audiences.length;

    if (!hasAllExpectedAudiences) {
      this._logger.warn(
        {
          feature: feature.name,
          actual: audiences.map((a) => a.name),
          expected: feature.audiences,
        },
        "check failed: not all expected audiences were found for this feature"
      );
    }
  }
}
