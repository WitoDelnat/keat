import { Synchronizer } from "./types";

export class DummySynchronizer implements Synchronizer {
  get ready(): Promise<void> {
    return Promise.resolve();
  }
  start(): void {
    return;
  }
  stop(): Promise<void> {
    return Promise.resolve();
  }
}
