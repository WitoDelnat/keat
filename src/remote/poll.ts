import AbortController, { AbortSignal } from "abort-controller";
import { PollingRemoteConfig, RemoteData } from "../config";
import { Engine } from "../core";
import { delay } from "../utils/delay";
import { Signal } from "../utils/signal";
import { isRemoteData } from "../utils/types";
import { Synchronizer } from "./types";

const DEFAULT_POLL_INTERVAL = 60000;

export class PollingSynchronizer implements Synchronizer {
  private _lastResponse?: RemoteData;
  private _task: Promise<void> = Promise.resolve();
  private _abortController: AbortController = new AbortController();
  private _signal: Signal = new Signal();

  constructor(private init: PollingRemoteConfig, private engine: Engine) {}

  get ready() {
    return this._signal.promise;
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
        const response = await this.init.fetch();
        this._lastResponse = response;

        if (!isRemoteData(response)) {
          throw new Error("invalid format");
        }

        this.engine.features = response;
      } catch (err) {
        this.init.onError?.(err, this._lastResponse);
      } finally {
        this._signal.resolve();
        await delay(this.init.pollInterval ?? DEFAULT_POLL_INTERVAL, signal);
      }
    } while (!signal.aborted);
  }
}
