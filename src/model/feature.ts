import { Audience } from "./audience";

export class Feature {
  constructor(
    public name: string,
    public audiences: Audience[],
    public enabled: boolean = true
  ) {}

  toggle() {
    this.enabled = !this.enabled;
  }

  isEnabled(user?: string): boolean {
    if (!this.enabled) return false;
    return this.audiences.some((audience) => audience.isEnabled(user));
  }
}
