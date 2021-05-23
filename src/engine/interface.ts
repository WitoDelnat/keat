import { Definitions } from "../model/definitions";
import { Feature } from "../model/feature";

export interface Engine {
  feature(name: string): Feature | undefined;
  features(): Feature[];
  definitions(): Definitions;

  start(): void;
  stop(): Promise<void>;
  ready: Promise<void>;
}
