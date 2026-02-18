import * as FileSystem from "expo-file-system";

const BACKUP_FILE = "stock-reminder-backup.sqlite";
const DB_FILE = "stock-reminder.db";

export const exportBackup = async (): Promise<string> => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_FILE}`;
  const backupPath = `${FileSystem.documentDirectory}${BACKUP_FILE}`;
  await FileSystem.copyAsync({ from: dbPath, to: backupPath });
  return backupPath;
};

export const restoreBackup = async (sourceUri: string): Promise<void> => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_FILE}`;
  await FileSystem.copyAsync({ from: sourceUri, to: dbPath });
};
