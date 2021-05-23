import AbortController from "node-abort-controller";
import { Logger } from "pino";
import { Client } from "../clients/interface";
import { AbstractEngine } from "./abstract";

type PollEngineInit = {
  client: Client;
  logger: Logger;
  pollInterval?: number;
  strict?: string[];
};

export class PollEngine extends AbstractEngine {
  private _abortController: AbortController = new AbortController();
  private _task: Promise<void> = Promise.resolve();

  private _client: Client;
  private _pollInterval: number;

  constructor(init: PollEngineInit) {
    super(init.logger, init.strict);
    this._client = init.client;
    this._pollInterval = init.pollInterval ?? 5000;
  }

  start() {
    this._abortController.abort();
    this._abortController = new AbortController();
    this._task = this.syncInBackground(this._abortController.signal);
  }

  async stop() {
    this._abortController.abort();
    return this._task;
  }

  private async syncInBackground(signal: AbortSignal): Promise<void> {
    do {
      try {
        const definitions = await this._client.getDefinitions();
        if (signal.aborted) break;

        this.set(definitions);
      } catch (err) {
        this._logger.error({ err }, "background sync failed");
      } finally {
        await new Promise((resolve) => setTimeout(resolve, this._pollInterval));
      }
    } while (!signal.aborted);
  }
}
