import { KeatRemoteConfig } from "../config";
import { Engine } from "../core";
import { delay } from "../utils/delay";
import { Signal } from "../utils/signal";
import { isRemoteData } from "../utils/types";
import { Synchronizer } from "./types";

const MAX_BACKOFF = 60;

export class KeatSynchronizer implements Synchronizer {
  private _source?: EventSource;
  private _task: Promise<void> = Promise.resolve();
  private _abortController: AbortController = new AbortController();
  private _ready: Signal = new Signal();

  constructor(private init: KeatRemoteConfig, private engine: Engine) {}

  get ready() {
    return this._ready.promise;
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

  private async syncInBackground(
    signal: AbortSignal,
    backoff: number = 1
  ): Promise<void> {
    do {
      try {
        await this.register(signal);
        this.createEventSource(signal);
      } catch (err) {
        this.init.onError?.(err);
      } finally {
        this._ready.resolve();
        backoff = Math.max(backoff * 2, MAX_BACKOFF);
        await delay(backoff * 1000, signal);
      }
    } while (!signal.aborted);
  }

  private async register(signal: AbortSignal) {
    const response = await fetch(`${this.init.origin}/api/applications`, {
      method: "POST",
      body: JSON.stringify({
        name: this.init.application,
        audiences: this.engine.audiences,
        features: this.engine.features,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error("register failed");
    }
  }

  private createEventSource(signal: AbortSignal) {
    const url = `${this.init.origin}/api/sync?app=${this.init.application}`;
    this._source = new EventSource(url);

    signal.addEventListener("abort", () => {
      this._source?.close();
    });

    this._source.onerror = () => {
      this.init.onError?.(new Error("event source failed"));
    };

    this._source.onmessage = (event) => {
      let remoteConfig;
      try {
        remoteConfig = JSON.parse(event.data);

        if (!isRemoteData(remoteConfig)) {
          throw new Error("invalid format");
        }

        this.engine.features = remoteConfig;
      } catch (err) {
        this.init.onError?.(err, remoteConfig);
      } finally {
        this._ready.resolve();
      }
    };
  }
}
