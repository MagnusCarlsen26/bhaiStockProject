import * as SQLite from "expo-sqlite";
import { DEFAULT_CATEGORIES } from "@/domain/categoryConfig";
import { CREATE_TABLES_SQL } from "@/db/schema";
import { ensureResetRows, seedDemoData } from "@/db/repository";

const db = SQLite.openDatabaseSync("stock-reminder.db");

export const bootstrapDatabase = async (): Promise<void> => {
  for (const statement of CREATE_TABLES_SQL) {
    db.execSync(statement);
  }

  for (const category of DEFAULT_CATEGORIES) {
    db.runSync(
      `INSERT OR IGNORE INTO categories (id, code, title, color, sortOrder) VALUES (?, ?, ?, ?, ?);`,
      [category.id, category.code, category.title, category.color, category.sortOrder]
    );
  }

  ensureResetRows();
  seedDemoData();
};

export const database = db;
