import AbortController, { AbortSignal } from "abort-controller";
import { isEqual } from "lodash";
import { PollingRemoteConfig, RemoteData } from "../config";
import { delay } from "../utils/delay";
import { Signal } from "../utils/signal";
import { isRemoteData } from "../utils/types";
import { Synchronizer } from "./types";

const DEFAULT_POLL_INTERVAL = 30000;

export class PollingSynchronizer implements Synchronizer {
  private _data?: RemoteData;

  private _task: Promise<void> = Promise.resolve();
  private _abortController: AbortController = new AbortController();
  private _signal: Signal = new Signal();
  public onChange?: (data: RemoteData) => void = undefined;

  constructor(private init: PollingRemoteConfig) {}

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
        const previousData = this._data;
        const response = await this.init.fetch();

        if (!isRemoteData(response)) {
          throw new Error("invalid format");
        }

        this._data = response;

        if (!isEqual(previousData, this._data)) {
          this.onChange?.(this._data);
          this.init.onChange?.(this._data, previousData);
        }

        this._signal.resolve();
      } catch (err) {
        this.init.onError?.(err, this._data);
      } finally {
        await delay(this.init.pollInterval ?? DEFAULT_POLL_INTERVAL, signal);
      }
    } while (!signal.aborted);
  }
}
