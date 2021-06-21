import { isObject, isString, isUndefined, values } from "lodash";
import { RemoteData } from "../config";

export function isDefined(x: unknown) {
  return !isUndefined(x);
}

export function isRemoteData(x: unknown): x is RemoteData {
  return isObject(x) && values(x).every((p) => isString(p));
}
