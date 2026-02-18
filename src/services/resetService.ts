import { database } from "@/db/client";
import { getCategories, getChecklistEntries, upsertChecklistEntry } from "@/db/repository";
import { getNextResetAt } from "@/domain/resetRules";
import { makeId } from "@/lib/id";

export type ResetSummary = {
  categoryId: string;
  resetAt: string;
  movedItems: number;
};

export const reconcileResets = (now: Date): ResetSummary[] => {
  const categories = getCategories();
  const summaries: ResetSummary[] = [];

  categories.forEach((category) => {
    const row = database.getFirstSync<{ nextResetAt: string }>(
      "SELECT nextResetAt FROM category_resets WHERE categoryId = ?",
      [category.id]
    );
    if (!row) {
      return;
    }

    let nextReset = new Date(row.nextResetAt);
    let guard = 0;

    while (nextReset.getTime() <= now.getTime() && guard < 10) {
      const entries = getChecklistEntries(category.id);
      entries.forEach((entry) => {
        const quantity = entry.isChecked || entry.quantity > 0 ? entry.quantity : 0;
        const source = entry.isChecked || entry.quantity > 0 ? "manual" : "auto-zero";

        database.runSync(
          `INSERT INTO history_events (id, categoryId, itemId, eventAt, quantity, unitPrice, source)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            makeId("hist"),
            category.id,
            entry.itemId,
            nextReset.toISOString(),
            quantity,
            entry.unitPrice ?? null,
            source
          ]
        );

        upsertChecklistEntry(category.id, {
          ...entry,
          isChecked: false,
          quantity: 0
        });
      });

      const computed = getNextResetAt(category.code, new Date(nextReset.getTime() + 1000));
      database.runSync(
        `UPDATE category_resets SET lastResetAt = ?, nextResetAt = ? WHERE categoryId = ?`,
        [nextReset.toISOString(), computed.toISOString(), category.id]
      );

      summaries.push({ categoryId: category.id, resetAt: nextReset.toISOString(), movedItems: entries.length });
      nextReset = computed;
      guard += 1;
    }
  });

  return summaries;
};
