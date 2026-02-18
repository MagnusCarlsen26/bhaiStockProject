import { create } from "zustand";
import {
  archiveItem,
  createItem,
  getCategories,
  getChecklistEntries,
  getItemCategoryIds,
  getItems,
  getReminderConfigs,
  recordHistoryEvent,
  saveReminderConfigs,
  setCategoryOrder,
  shiftItemPriority,
  updateItem,
  upsertChecklistEntry
} from "@/db/repository";
import { ChecklistEntry, Item, ReminderConfig } from "@/domain/types";

type ChecklistState = {
  categories: ReturnType<typeof getCategories>;
  items: Item[];
  reminders: ReminderConfig[];
  entriesByCategory: Record<string, ChecklistEntry[]>;
  hydrate: () => void;
  addItem: (input: { name: string; unit: string; defaultPrice?: number; categoryIds: string[] }) => void;
  editItem: (input: { id: string; name: string; unit: string; defaultPrice?: number; categoryIds: string[] }) => void;
  removeItem: (itemId: string) => void;
  reorderItemInCategory: (categoryId: string, itemId: string, direction: "up" | "down") => void;
  setCategoryOrder: (categoryId: string, orderedItemIds: string[]) => void;
  getItemCategoryIds: (itemId: string) => string[];
  saveReminders: (configs: ReminderConfig[]) => void;
  upsertEntry: (categoryId: string, entry: ChecklistEntry) => void;
  toggleCheck: (categoryId: string, entryId: string) => void;
};

const mapEntries = (categoryIds: string[]) => {
  const mapped: Record<string, ChecklistEntry[]> = {};
  categoryIds.forEach((id) => {
    mapped[id] = getChecklistEntries(id);
  });
  return mapped;
};

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  categories: [],
  items: [],
  reminders: [],
  entriesByCategory: {},
  hydrate: () => {
    const categories = getCategories();
    const items = getItems();
    const reminders = getReminderConfigs();
    const entriesByCategory = mapEntries(categories.map((c) => c.id));
    set({ categories, items, reminders, entriesByCategory });
  },
  addItem: (input) => {
    createItem(input);
    get().hydrate();
  },
  editItem: (input) => {
    updateItem(input);
    get().hydrate();
  },
  removeItem: (itemId) => {
    archiveItem(itemId);
    get().hydrate();
  },
  reorderItemInCategory: (categoryId, itemId, direction) => {
    shiftItemPriority(categoryId, itemId, direction);
    get().hydrate();
  },
  setCategoryOrder: (categoryId, orderedItemIds) => {
    setCategoryOrder(categoryId, orderedItemIds);
    get().hydrate();
  },
  getItemCategoryIds: (itemId) => getItemCategoryIds(itemId),
  saveReminders: (configs) => {
    saveReminderConfigs(configs);
    set({ reminders: configs });
  },
  upsertEntry: (categoryId, entry) => {
    upsertChecklistEntry(categoryId, entry);
    // Record a history event whenever quantity or check state changes
    if (entry.isChecked || entry.quantity > 0) {
      recordHistoryEvent(categoryId, entry);
    }
    set((state) => {
      const list = state.entriesByCategory[categoryId] ?? [];
      const idx = list.findIndex((existing) => existing.id === entry.id);
      const next = [...list];
      if (idx >= 0) {
        next[idx] = entry;
      } else {
        next.push(entry);
      }
      return { entriesByCategory: { ...state.entriesByCategory, [categoryId]: next } };
    });
  },
  toggleCheck: (categoryId, entryId) => {
    const existing = (get().entriesByCategory[categoryId] ?? []).find((entry) => entry.id === entryId);
    if (!existing) {
      return;
    }
    const updated: ChecklistEntry = { ...existing, isChecked: !existing.isChecked };
    upsertChecklistEntry(categoryId, updated);
    // Record history event when item is checked (not when unchecked)
    if (updated.isChecked) {
      recordHistoryEvent(categoryId, updated);
    }
    get().upsertEntry(categoryId, updated);
  }
}));
