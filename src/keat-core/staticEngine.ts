import { Logger } from "pino";
import { Definitions } from "./definitions";
import { AbstractEngine } from "./engine";

export class StaticEngine extends AbstractEngine {
  constructor(private init: Definitions, logger: Logger) {
    super(logger);
  }

  start() {
    this.set(this.init);
    return;
  }

  stop() {
    return Promise.resolve();
  }
}
