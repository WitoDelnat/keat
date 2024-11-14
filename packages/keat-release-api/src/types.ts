export type App = {
    name?: string
    env?: string
    features?: Feature[]
    cohorts?: Cohort[]
}

export type Feature = {
    name: string
    cohorts: string[]
}

export type Cohort = Group | Rollout

type BaseCohort = {
    name: string
    strategy: string
}

export type Group = BaseCohort & {
    name: string
    strategy: 'group'
    targets: string[]
}

export type Rollout = BaseCohort & {
    name: string
    strategy: 'rollout'
    percentage: number
}

export type KeatConfig = {
    features: Record<string, string[] | undefined>
    cohorts: Record<string, any>
}
