export const CREATE_TABLES_SQL: string[] = [
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    color TEXT NOT NULL,
    sortOrder INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    defaultPrice REAL,
    isArchived INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS item_categories (
    itemId TEXT NOT NULL,
    categoryId TEXT NOT NULL,
    priorityOrder INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (itemId, categoryId)
  );`,
  `CREATE TABLE IF NOT EXISTS checklist_entries (
    categoryId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    isChecked INTEGER NOT NULL DEFAULT 0,
    quantity REAL NOT NULL DEFAULT 0,
    unitPrice REAL,
    updatedAt TEXT NOT NULL,
    PRIMARY KEY (categoryId, itemId)
  );`,
  `CREATE TABLE IF NOT EXISTS history_events (
    id TEXT PRIMARY KEY,
    categoryId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    eventAt TEXT NOT NULL,
    quantity REAL NOT NULL,
    unitPrice REAL,
    source TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS category_resets (
    categoryId TEXT PRIMARY KEY,
    lastResetAt TEXT,
    nextResetAt TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );`
];
