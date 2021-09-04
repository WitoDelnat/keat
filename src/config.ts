import { AudienceDefault, AudienceFn } from "./core";

/**
 * Bring your own user with declaration merging:
 *
 * @example
 * ```
 * declare module 'keat' {
 *   interface CustomTypes {
 *     user: { name: string, email: string, developerPreview: boolean }
 *   }
 * }
 * ```
 *
 * @remark Currently only Record<string, string | boolean | number> is allowed.
 */
export interface CustomTypes {
  // user: ...
}

export type User = CustomTypes extends { user: infer T } ? T : string;

export type Config<
  FName extends string,
  FAudience extends AName,
  AName extends string
> = ConfigWithoutAudience<FName> | ConfigWithAudience<FName, FAudience, AName>;

export type ConfigWithoutAudience<FName extends string> = {
  audiences?: never;
  features: Record<FName, AudienceDefault | AudienceDefault[]>;
  remoteConfig?: RemoteConfig<FName>;
} & UserConfig;

export type ConfigWithAudience<
  FName extends string,
  FAudience extends AName,
  AName extends string
> = {
  audiences: Record<AName, AudienceFn>;
  features: Record<
    FName,
    FAudience | AudienceDefault | (FAudience | AudienceDefault)[]
  >;
  remoteConfig?: RemoteConfig<FName>;
} & UserConfig;

export type UserConfig = {
  /**
   * The key of the property identifying a user.
   * Required for sticky audiences.
   * Defaults to `'id'`.
   *
   * @example
   * type User = { sub: string, ...}
   * const userConfig = { idKey = 'sub' }
   */
  identifier: User extends string ? never : keyof User;
};

export type RemoteConfig<FNames extends string = string> =
  | PollingRemoteConfig<FNames>
  | KeatRemoteConfig;

export type PollingRemoteConfig<FNames extends string = string> = {
  kind: "poll";
  pollInterval?: number;
  fetch: () => Promise<RemoteData<FNames>>;
  onError?: (err: Error, data: unknown) => void;
};

export type KeatRemoteConfig = {
  kind: "keat";
  origin: string;
  application: string;
  onError?: (err: Error, data?: unknown) => void;
};

export type RemoteData<FNames extends string = string> = Partial<
  Record<FNames, number | string | (number | string)[]>
>;
