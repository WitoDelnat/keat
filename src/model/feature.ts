import { toPairs } from "lodash";
import { Audience, EVERYONE } from "./audience";
import { FeatureDefinition } from "./definitions";
import { Labels, LabelSelectors } from "./labels";
import { User } from "./user";

type FeatureInit = {
  name: string;
  labels?: Labels;
  audiences?: Audience[];
  enabled?: boolean;
};

export class Feature {
  public name: string;
  public labels: Labels;
  public audiences: Audience[];
  public enabled: boolean;

  constructor(init: FeatureInit) {
    this.name = init.name;
    this.labels = init.labels ?? {};
    this.audiences = init.audiences ?? [EVERYONE];
    this.enabled = init.enabled ?? true;
  }

  match(labels?: LabelSelectors): boolean {
    if (!labels) return true;

    for (const [key, value] of toPairs(labels)) {
      if (this.labels[key] !== value) {
        return false;
      }
    }

    return true;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  isEnabled(user?: User): boolean {
    if (!this.enabled) return false;
    return this.audiences.some((audience) => audience.includes(user));
  }

  toDefinition(): FeatureDefinition {
    return {
      name: this.name,
      audiences: this.audiences.map((a) => a.name),
      enabled: this.enabled,
      labels: this.labels,
    };
  }
}
