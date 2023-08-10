import { createPlugin } from "../plugin";
import { isString } from "../matchers";
const DAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];
export const businessHours = (name, schedule = DEFAULT_SCHEDULE) => {
    return createPlugin({
        matcher: isString,
        evaluate({ literal }) {
            if (literal !== name)
                return false;
            const now = new Date();
            const hour = new Date().getHours();
            const periods = schedule[DAYS[now.getDay()]] ?? [];
            return periods.some((p) => p.from <= hour && hour >= p.to);
        },
    });
};
const DEFAULT_SCHEDULE = {
    monday: [{ from: 9, to: 5 }],
    tuesday: [{ from: 9, to: 5 }],
    wednesday: [{ from: 9, to: 5 }],
    thursday: [{ from: 9, to: 5 }],
    friday: [{ from: 9, to: 5 }],
};
