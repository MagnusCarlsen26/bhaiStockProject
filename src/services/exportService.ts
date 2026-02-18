import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { ReportRow } from "@/domain/types";

const csvHeader = "Item Name,Total Quantity,Frequency,Total Cost";

const getWritableDir = (): string => {
  const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!dir) {
    throw new Error("No writable directory found");
  }
  return dir;
};

export const buildCsv = (rows: ReportRow[]): string => {
  const body = rows
    .map((row) => `${row.itemName},${row.totalQuantity},${row.frequency},${row.totalCost.toFixed(2)}`)
    .join("\n");
  return `${csvHeader}\n${body}`;
};

export const exportCsvAndShare = async (rows: ReportRow[]): Promise<void> => {
  const content = buildCsv(rows);
  const fileUri = `${getWritableDir()}report-${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType: "text/csv" });
  }
};

export const exportXlsxAndShare = async (rows: ReportRow[]): Promise<void> => {
  const sheetData = rows.map((row) => ({
    "Item Name": row.itemName,
    "Total Quantity": row.totalQuantity,
    Frequency: row.frequency,
    "Total Cost": Number(row.totalCost.toFixed(2))
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  const base64 = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
  const fileUri = `${getWritableDir()}report-${Date.now()}.xlsx`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
  }
};
