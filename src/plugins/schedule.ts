import { createPlugin, isString } from "../core";

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type Day = (typeof DAYS)[number];
type Period = { from: number; to: number };
type Schedule = Partial<Record<Day, Period[]>>;

export const businessHours = (
  name: string,
  schedule: Schedule = DEFAULT_SCHEDULE
) => {
  return createPlugin({
    matcher: isString,
    evaluate({ literal }) {
      if (literal !== name) return false;
      const now = new Date();
      const hour = new Date().getHours();
      const periods = schedule[DAYS[now.getDay()]] ?? [];
      return periods.some((p) => p.from <= hour && hour >= p.to);
    },
  });
};

const DEFAULT_SCHEDULE: Schedule = {
  monday: [{ from: 9, to: 5 }],
  tuesday: [{ from: 9, to: 5 }],
  wednesday: [{ from: 9, to: 5 }],
  thursday: [{ from: 9, to: 5 }],
  friday: [{ from: 9, to: 5 }],
};
