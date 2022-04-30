import { PollingRemoteConfig } from "../config";
import { Engine } from "../core";
import { delay } from "../utils/delay";
import { Signal } from "../utils/signal";
import { isRemoteData } from "../utils/types";
import { Synchronizer } from "./types";

const DEFAULT_POLL_INTERVAL = 60000;

export class PollingSynchronizer implements Synchronizer {
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
      let remoteConfig;
      try {
        remoteConfig = await this.init.fetch();

        if (!isRemoteData(remoteConfig)) {
          throw new Error("invalid format");
        }

        this.engine.features = remoteConfig;
      } catch (err: any) {
        this.init.onError?.(err, remoteConfig);
      } finally {
        this._signal.resolve();

        const pollInterval = this.init.pollInterval;
        if (pollInterval !== undefined && pollInterval <= 0) {
          return;
        }

        await delay(pollInterval ?? DEFAULT_POLL_INTERVAL, signal);
      }
    } while (!signal.aborted);
  }
}
