import { Config, Rule } from "../types";
export declare const localConfig: (config: Config) => import("../plugin").Plugin<(literal: unknown) => unknown>;
export declare function fromEnv(value?: string): Rule | undefined;
