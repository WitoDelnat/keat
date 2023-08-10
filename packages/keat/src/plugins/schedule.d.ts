declare const DAYS: readonly ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
type Day = (typeof DAYS)[number];
type Period = {
    from: number;
    to: number;
};
type Schedule = Partial<Record<Day, Period[]>>;
export declare const businessHours: (name: string, schedule?: Schedule) => import("../plugin").Plugin<import("../matchers").Matcher<string>>;
export {};
