import { dayOfYear, localMidnight } from "@/lib/date";
import { CategoryCode } from "@/domain/types";

const nextMonday = (date: Date): Date => {
  const d = localMidnight(date);
  const day = d.getDay();
  const delta = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + delta);
  return d;
};

export const getNextResetAt = (
  code: CategoryCode,
  now: Date,
  rollingAnchorDay = 1
): Date => {
  const base = localMidnight(now);

  if (code === "DAILY") {
    base.setDate(base.getDate() + 1);
    return base;
  }

  if (code === "ROLLING_3DAY") {
    const today = dayOfYear(base);
    const offset = (3 - ((today - rollingAnchorDay) % 3)) % 3;
    base.setDate(base.getDate() + (offset === 0 ? 3 : offset));
    return base;
  }

  if (code === "WEEKLY") {
    return nextMonday(now);
  }

  if (code === "FORTNIGHTLY") {
    const d = localMidnight(now);
    const day = d.getDate();
    if (day < 16) {
      d.setDate(16);
      return d;
    }
    d.setMonth(d.getMonth() + 1, 1);
    return d;
  }

  const monthly = localMidnight(now);
  monthly.setMonth(monthly.getMonth() + 1, 1);
  return monthly;
};
