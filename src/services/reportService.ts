import { ReportFilter, ReportRow } from "@/domain/types";

export const summarizeReport = (
  rows: Array<{ itemId: string; itemName: string; quantity: number; unitPrice?: number }>,
  _filter: ReportFilter
): ReportRow[] => {
  const map = new Map<string, ReportRow>();

  for (const row of rows) {
    const existing = map.get(row.itemId);
    if (!existing) {
      map.set(row.itemId, {
        itemId: row.itemId,
        itemName: row.itemName,
        totalQuantity: row.quantity,
        frequency: row.quantity > 0 ? 1 : 0,
        totalCost: (row.unitPrice ?? 0) * row.quantity
      });
      continue;
    }

    existing.totalQuantity += row.quantity;
    if (row.quantity > 0) {
      existing.frequency += 1;
    }
    existing.totalCost += (row.unitPrice ?? 0) * row.quantity;
  }

  return [...map.values()].sort((a, b) => b.totalQuantity - a.totalQuantity);
};
