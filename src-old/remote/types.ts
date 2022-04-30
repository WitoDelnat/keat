import { RemoteData } from "../config";

export interface Synchronizer {
  get ready(): Promise<void>;
  start(): void;
  stop(): Promise<void>;
  onChange?: (data: RemoteData) => void;
}
