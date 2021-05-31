import { Audience, EVERYONE } from "./audience";

type FeatureInit = {
  name: string;
  audiences?: Audience[];
  enabled?: boolean;
};

export class Feature {
  public name: string;
  public audiences: Audience[];
  public enabled: boolean;

  constructor(init: FeatureInit) {
    this.name = init.name;
    this.audiences = init.audiences ?? [EVERYONE];
    this.enabled = init.enabled ?? true;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  isEnabled(user?: string): boolean {
    if (!this.enabled) return false;
    return this.audiences.some((audience) => audience.includes(user));
  }
}
