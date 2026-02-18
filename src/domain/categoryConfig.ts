import { Category } from "@/domain/types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-daily", code: "DAILY", title: "Daily Checklist", color: "#FFB74D", sortOrder: 1 },
  { id: "cat-rolling3", code: "ROLLING_3DAY", title: "Rolling 3-Day", color: "#64B5F6", sortOrder: 2 },
  { id: "cat-weekly", code: "WEEKLY", title: "Weekly Checklist", color: "#F48FB1", sortOrder: 3 },
  { id: "cat-15days", code: "FORTNIGHTLY", title: "15 Days Checklist", color: "#4DB6AC", sortOrder: 4 },
  { id: "cat-monthly", code: "MONTHLY", title: "Monthly Checklist", color: "#B39DDB", sortOrder: 5 }
];
