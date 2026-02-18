import { database } from "@/db/client";
import { DEFAULT_CATEGORIES } from "@/domain/categoryConfig";
import { getNextResetAt } from "@/domain/resetRules";
import { Category, ChecklistEntry, Item, ReminderConfig } from "@/domain/types";
import { makeId } from "@/lib/id";

type CategoryRow = Category;
type ItemRow = {
  id: string;
  name: string;
  unit: string;
  defaultPrice: number | null;
  isArchived: number;
};

type EntryRow = {
  itemId: string;
  itemName: string;
  unit: string;
  isChecked: number;
  quantity: number;
  unitPrice: number | null;
};

const REMINDER_KEY = "reminders";

export const getCategories = (): Category[] => {
  return database.getAllSync<CategoryRow>(
    "SELECT id, code, title, color, sortOrder FROM categories ORDER BY sortOrder ASC"
  );
};

export const getItems = (): Item[] => {
  const rows = database.getAllSync<ItemRow>(
    "SELECT id, name, unit, defaultPrice, isArchived FROM items WHERE isArchived = 0 ORDER BY name ASC"
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
    defaultPrice: row.defaultPrice ?? undefined,
    isArchived: row.isArchived === 1
  }));
};

export const createItem = (input: {
  name: string;
  unit: string;
  defaultPrice?: number;
  categoryIds: string[];
}): void => {
  const now = new Date().toISOString();
  const id = makeId("item");
  database.runSync(
    `INSERT INTO items (id, name, unit, defaultPrice, isArchived, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 0, ?, ?)`,
    [id, input.name.trim(), input.unit.trim(), input.defaultPrice ?? null, now, now]
  );

  replaceItemCategories(id, input.categoryIds);
};

export const updateItem = (input: {
  id: string;
  name: string;
  unit: string;
  defaultPrice?: number;
  categoryIds: string[];
}): void => {
  const now = new Date().toISOString();
  database.runSync(
    `UPDATE items SET name = ?, unit = ?, defaultPrice = ?, updatedAt = ? WHERE id = ?`,
    [input.name.trim(), input.unit.trim(), input.defaultPrice ?? null, now, input.id]
  );
  replaceItemCategories(input.id, input.categoryIds);
};

export const archiveItem = (itemId: string): void => {
  const now = new Date().toISOString();
  database.runSync(`UPDATE items SET isArchived = 1, updatedAt = ? WHERE id = ?`, [now, itemId]);
  database.runSync(`DELETE FROM item_categories WHERE itemId = ?`, [itemId]);
  database.runSync(`DELETE FROM checklist_entries WHERE itemId = ?`, [itemId]);
};

const replaceItemCategories = (itemId: string, categoryIds: string[]): void => {
  const now = new Date().toISOString();
  database.runSync(`DELETE FROM item_categories WHERE itemId = ?`, [itemId]);
  database.runSync(`DELETE FROM checklist_entries WHERE itemId = ?`, [itemId]);

  categoryIds.forEach((categoryId, index) => {
    database.runSync(
      `INSERT INTO item_categories (itemId, categoryId, priorityOrder) VALUES (?, ?, ?)`,
      [itemId, categoryId, index]
    );
    database.runSync(
      `INSERT OR IGNORE INTO checklist_entries (categoryId, itemId, isChecked, quantity, unitPrice, updatedAt)
       VALUES (?, ?, 0, 0, NULL, ?)`,
      [categoryId, itemId, now]
    );
  });
};

export const setCategoryOrder = (categoryId: string, orderedItemIds: string[]): void => {
  orderedItemIds.forEach((itemId, index) => {
    database.runSync(
      `UPDATE item_categories SET priorityOrder = ? WHERE categoryId = ? AND itemId = ?`,
      [index, categoryId, itemId]
    );
  });
};

export const shiftItemPriority = (categoryId: string, itemId: string, direction: "up" | "down"): void => {
  const rows = database.getAllSync<{ itemId: string; priorityOrder: number }>(
    `SELECT itemId, priorityOrder FROM item_categories WHERE categoryId = ? ORDER BY priorityOrder ASC`,
    [categoryId]
  );
  const index = rows.findIndex((row) => row.itemId === itemId);
  if (index < 0) {
    return;
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= rows.length) {
    return;
  }

  const current = rows[index];
  const target = rows[swapIndex];

  database.runSync(
    `UPDATE item_categories SET priorityOrder = ? WHERE categoryId = ? AND itemId = ?`,
    [target.priorityOrder, categoryId, current.itemId]
  );
  database.runSync(
    `UPDATE item_categories SET priorityOrder = ? WHERE categoryId = ? AND itemId = ?`,
    [current.priorityOrder, categoryId, target.itemId]
  );
};

export const getItemCategoryIds = (itemId: string): string[] => {
  const rows = database.getAllSync<{ categoryId: string }>(
    `SELECT categoryId FROM item_categories WHERE itemId = ? ORDER BY priorityOrder ASC`,
    [itemId]
  );
  return rows.map((r) => r.categoryId);
};

export const getChecklistEntries = (categoryId: string): ChecklistEntry[] => {
  const rows = database.getAllSync<EntryRow>(
    `SELECT i.id AS itemId, i.name AS itemName, i.unit AS unit,
            COALESCE(ce.isChecked, 0) AS isChecked,
            COALESCE(ce.quantity, 0) AS quantity,
            COALESCE(ce.unitPrice, i.defaultPrice) AS unitPrice
     FROM item_categories ic
     JOIN items i ON i.id = ic.itemId AND i.isArchived = 0
     LEFT JOIN checklist_entries ce ON ce.categoryId = ic.categoryId AND ce.itemId = ic.itemId
     WHERE ic.categoryId = ?
     ORDER BY ic.priorityOrder ASC, i.name ASC`,
    [categoryId]
  );

  return rows.map((row) => ({
    id: `${categoryId}:${row.itemId}`,
    itemId: row.itemId,
    itemName: row.itemName,
    unit: row.unit,
    isChecked: row.isChecked === 1,
    quantity: row.quantity,
    unitPrice: row.unitPrice ?? undefined
  }));
};

export const upsertChecklistEntry = (categoryId: string, entry: ChecklistEntry): void => {
  const now = new Date().toISOString();
  database.runSync(
    `INSERT INTO checklist_entries (categoryId, itemId, isChecked, quantity, unitPrice, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(categoryId, itemId)
     DO UPDATE SET isChecked = excluded.isChecked, quantity = excluded.quantity, unitPrice = excluded.unitPrice, updatedAt = excluded.updatedAt`,
    [categoryId, entry.itemId, entry.isChecked ? 1 : 0, entry.quantity, entry.unitPrice ?? null, now]
  );
};

export const recordHistoryEvent = (
  categoryId: string,
  entry: ChecklistEntry,
  source: "manual" | "auto-zero" = "manual"
): void => {
  const now = new Date().toISOString();
  database.runSync(
    `INSERT INTO history_events (id, categoryId, itemId, eventAt, quantity, unitPrice, source)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [makeId("hist"), categoryId, entry.itemId, now, entry.quantity, entry.unitPrice ?? null, source]
  );
};


export const getHistoryRows = (filter: {
  from?: string;
  to?: string;
  categoryIds?: string[];
  limit?: number;
}): Array<{ itemId: string; itemName: string; quantity: number; unitPrice?: number }> => {
  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (filter.from) {
    clauses.push("h.eventAt >= ?");
    params.push(filter.from);
  }
  if (filter.to) {
    clauses.push("h.eventAt <= ?");
    params.push(filter.to);
  }
  if (filter.categoryIds && filter.categoryIds.length > 0) {
    const placeholders = filter.categoryIds.map(() => "?").join(",");
    clauses.push(`h.categoryId IN (${placeholders})`);
    params.push(...filter.categoryIds);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = filter.limit ?? 500;

  const rows = database.getAllSync<{
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number | null;
  }>(
    `SELECT h.itemId as itemId, i.name as itemName, h.quantity as quantity, h.unitPrice as unitPrice
     FROM history_events h JOIN items i ON i.id = h.itemId
     ${where}
     ORDER BY h.eventAt DESC LIMIT ${limit}`,
    params
  );

  return rows.map((row) => ({ ...row, unitPrice: row.unitPrice ?? undefined }));
};

export const getReminderConfigs = (): ReminderConfig[] => {
  const row = database.getFirstSync<{ value: string }>(`SELECT value FROM app_settings WHERE key = ?`, [
    REMINDER_KEY
  ]);
  if (!row) {
    return getCategories().map((c) => ({
      categoryId: c.id,
      enabled: c.code === "DAILY",
      hour: 21,
      minute: 0
    }));
  }

  try {
    const parsed = JSON.parse(row.value) as ReminderConfig[];
    return parsed;
  } catch {
    return [];
  }
};

export const saveReminderConfigs = (configs: ReminderConfig[]): void => {
  const now = new Date().toISOString();
  database.runSync(
    `INSERT INTO app_settings (key, value, updatedAt) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
    [REMINDER_KEY, JSON.stringify(configs), now]
  );
};

export const ensureResetRows = (): void => {
  const categories = getCategories();
  const now = new Date();
  categories.forEach((category) => {
    const existing = database.getFirstSync<{ categoryId: string }>(
      "SELECT categoryId FROM category_resets WHERE categoryId = ?",
      [category.id]
    );
    if (!existing) {
      const next = getNextResetAt(category.code, now).toISOString();
      database.runSync(
        "INSERT INTO category_resets (categoryId, lastResetAt, nextResetAt) VALUES (?, NULL, ?)",
        [category.id, next]
      );
    }
  });
};

export const seedDemoData = (): void => {
  const itemCount = database.getFirstSync<{ count: number }>("SELECT COUNT(*) as count FROM items");
  if ((itemCount?.count ?? 0) === 0) {
    createItem({ name: "Milk", unit: "L", defaultPrice: 2.5, categoryIds: ["cat-daily"] });
    createItem({ name: "Bread", unit: "pcs", defaultPrice: 1.2, categoryIds: ["cat-daily", "cat-rolling3"] });
    createItem({ name: "Rice", unit: "kg", defaultPrice: 4, categoryIds: ["cat-weekly", "cat-15days"] });
    createItem({ name: "Soap", unit: "pcs", defaultPrice: 1.8, categoryIds: ["cat-monthly"] });
  }

  const settings = database.getFirstSync<{ key: string }>("SELECT key FROM app_settings WHERE key = ?", [
    REMINDER_KEY
  ]);
  if (!settings) {
    saveReminderConfigs(getReminderConfigs());
  }
};
