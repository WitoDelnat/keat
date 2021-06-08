import { Logger } from "pino";
import { Definitions } from "../model/definitions";
import { AbstractEngine } from "./abstract";

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
