import AbortController, { AbortSignal } from "node-abort-controller";
import { Logger } from "pino";
import { AbstractEngine, LabelSelectors } from "../keat-core";
import { delay } from "../utils/delay";
import { KubeClient } from "./kubeClient";

type PollEngineInit = {
  client: KubeClient;
  logger: Logger;
  pollInterval?: number;
  strict?: string[];
  labels?: LabelSelectors;
};

export class KubeEngine extends AbstractEngine {
  private _abortController: AbortController = new AbortController();
  private _task: Promise<void> = Promise.resolve();

  private _client: KubeClient;
  private _pollInterval: number;
  private _labels: LabelSelectors | undefined;

  constructor(init: PollEngineInit) {
    super(init.logger, init.strict);
    this._client = init.client;
    this._pollInterval = init.pollInterval ?? 5000;
    this._labels = init.labels;
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
        const definitions = await this._client.getDefinitions(this._labels);
        if (signal.aborted) break;

        this.set(definitions);
      } catch (err) {
        this._logger.error({ err }, "background sync failed");
      } finally {
        await delay(this._pollInterval, signal);
      }
    } while (!signal.aborted);
  }
}
