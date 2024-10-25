import type { Rule } from "keat";

export type KeatReleaseConfig = {
  stages: {
    name: string;
    displayName?: string;
    args?: Record<string, Arg> | undefined;
    rule: (args: Record<string, any>) => Rule;
  }[];
  environments: {
    name: string;
    features: Record<string, Rule>;
  }[];
};

export type Stage = { name: string } & StageInit;
export type Env = { name: string } & EnvInit;
export type Arg = {
  type: "string" | "date";
  default?: string;
  optional?: boolean;
};

type StageBuilder = {
  arg: {
    date: (init?: { optional?: boolean; default?: Date }) => Arg;
    string: (init: { optional?: boolean; default?: string }) => Arg;
  };
};

type StageInit = (t: StageBuilder) => {
  displayName?: string;
  args?: Record<string, Arg>;
  rule: (args: Record<string, any>) => Rule;
};

type EnvBuilder = {
  stage: (name: string, args?: any) => Rule;
};

type EnvInit = (t: EnvBuilder) => {
  features: Record<string, Rule>;
};

export default class Keat {
  private static isBuild = false;
  private static stages = new Map<string, StageInit>();
  private static environments = new Map<string, EnvInit>();

  static stage(name: string, stage: StageInit) {
    if (this.isBuild) throw new Error("cannot add stage after release");
    if (this.stages.has(name)) throw new Error("duplicate stage");
    this.stages.set(name, stage);
  }

  static environment(name: string, env: EnvInit) {
    if (this.isBuild) throw new Error("cannot add env after release");
    if (this.environments.has(name)) throw new Error("duplicate stage");
    this.environments.set(name, env);
  }

  static release(): KeatReleaseConfig {
    if (this.isBuild) throw new Error("cannot_release_twice");
    this.isBuild = true;

    const stages = Array.from(this.stages.entries()).map(([name, init]) => {
      const stage = init({
        arg: {
          date: () => ({ type: "date" }),
          string: () => ({ type: "string" }),
        },
      });
      return {
        name,
        ...stage,
      };
    });

    const environments = Array.from(this.environments.entries()).map(
      ([name, init]) => {
        const env = init({
          stage: (name, args) => {
            const stage = stages.find((s) => s.name === name);
            if (!stage) return false;
            return stage.rule(args);
          },
        });
        return {
          name,
          ...env,
        };
      }
    );

    return {
      stages,
      environments,
    };
  }
}
