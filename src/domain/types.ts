export type CategoryCode =
  | "DAILY"
  | "ROLLING_3DAY"
  | "WEEKLY"
  | "FORTNIGHTLY"
  | "MONTHLY";

export type Category = {
  id: string;
  code: CategoryCode;
  title: string;
  color: string;
  sortOrder: number;
};

export type Item = {
  id: string;
  name: string;
  unit: string;
  defaultPrice?: number;
  isArchived: boolean;
};

export type ChecklistEntry = {
  id: string;
  itemId: string;
  itemName: string;
  unit: string;
  isChecked: boolean;
  quantity: number;
  unitPrice?: number;
};

export type ReportFilter = {
  from: string;
  to: string;
  categoryIds?: string[];
};

export type ReportRow = {
  itemId: string;
  itemName: string;
  totalQuantity: number;
  frequency: number;
  totalCost: number;
};

export type ReminderConfig = {
  categoryId: string;
  enabled: boolean;
  hour: number;
  minute: number;
};
