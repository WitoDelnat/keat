import { Logger } from "pino";
import { UserKey } from "./model/user";

export type DefinitionsConfig<FName extends string> = {
  definitions: unknown;
  strict?: FName[];
  logger?: boolean | Logger;
};

export type KubernetesConfig<FName extends string> = {
  path?: string;
  pollInterval?: number;
  labels?: Record<string, string>;
  strict?: FName[];
  logger?: boolean | Logger;
};

export type KeatServerConfig<FName extends string> = {
  origin?: string;
  pollInterval?: number;
  labels?: Record<string, string>;
  strict?: FName[];
  logger?: boolean | Logger;
};

export type StaticConfig<
  FName extends string,
  AName extends ANames,
  ANames extends string
> =
  | StaticWithoutAudiencesConfig<string>
  | StaticWithAudiencesConfig<FName, AName, ANames>;

type StaticWithoutAudiencesConfig<FName extends string> = {
  audiences?: undefined;
  features: Feature<FName, never>[];
  logger?: boolean | Logger;
};

type StaticWithAudiencesConfig<
  FName extends string,
  AName extends ANames,
  ANames extends string
> = {
  audiences: Audience<ANames>[];
  features: Feature<FName, AName>[];
  logger?: boolean | Logger;
};

export type Feature<FName extends string, AName extends string = never> = {
  name: FName;
  labels?: Record<string, string>;
  audiences?: (AName | "everyone" | "nobody")[];
  enabled?: boolean;
};

export type Audience<AName extends string = string> =
  | StaticAudience<AName>
  | RandomAudience<AName>;

export type StaticAudience<AName extends string> = {
  kind: "static";
  name: AName;
  members: (string | number | boolean)[];
} & UserKey;

export type StickyAudience<AName extends string> = {
  kind: "sticky";
  name: AName;
  percentage: number;
} & UserKey;

export type RandomAudience<AName extends string> = {
  kind: "random";
  name: AName;
  percentage: number;
};
