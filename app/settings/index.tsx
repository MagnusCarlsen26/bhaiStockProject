import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import * as Notifications from "expo-notifications";
import * as Sharing from "expo-sharing";
import { useChecklistStore } from "@/features/dashboard/store";
import { registerReminders } from "@/services/notificationService";
import { exportBackup, restoreBackup } from "@/services/backupService";
import { colors, spacing } from "@/ui/theme/tokens";

export default function SettingsScreen() {
  const categories = useChecklistStore((s) => s.categories);
  const items = useChecklistStore((s) => s.items);
  const reminders = useChecklistStore((s) => s.reminders);
  const hydrate = useChecklistStore((s) => s.hydrate);
  const editItem = useChecklistStore((s) => s.editItem);
  const removeItem = useChecklistStore((s) => s.removeItem);
  const getItemCategoryIds = useChecklistStore((s) => s.getItemCategoryIds);
  const saveReminders = useChecklistStore((s) => s.saveReminders);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const editableCategoryIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  const reminderMap = useMemo(() => {
    const map = new Map(reminders.map((r) => [r.categoryId, r]));
    return categories.map((category) => {
      const val = map.get(category.id) ?? { categoryId: category.id, enabled: false, hour: 21, minute: 0 };
      return { category, val };
    });
  }, [categories, reminders]);

  const updateReminder = async (categoryId: string, patch: Partial<{ enabled: boolean; hour: number; minute: number }>) => {
    const next = reminders.map((r) => (r.categoryId === categoryId ? { ...r, ...patch } : r));
    const exists = next.some((r) => r.categoryId === categoryId);
    const resolved = exists ? next : [...next, { categoryId, enabled: true, hour: 21, minute: 0, ...patch }];
    saveReminders(resolved);
    await Notifications.requestPermissionsAsync();
    await registerReminders(resolved);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.section}>Category Priority</Text>
        <View style={styles.card}>
          {categories.map((category) => (
            <Pressable key={category.id} onPress={() => router.push(`/settings/reorder/${category.id}`)} style={styles.linkRow}>
              <Text style={styles.name}>{category.title}</Text>
              <Text style={styles.link}>Reorder</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Reminders</Text>
        {reminderMap.map(({ category, val }) => (
          <View key={category.id} style={styles.card}>
            <Text style={styles.name}>{category.title}</Text>
            <View style={styles.reminderRow}>
              <Switch value={val.enabled} onValueChange={(enabled) => void updateReminder(category.id, { enabled })} />
              <Pressable onPress={() => void updateReminder(category.id, { hour: (val.hour + 1) % 24 })} style={styles.timeBtn}>
                <Text style={styles.timeText}>Hour {String(val.hour).padStart(2, "0")}</Text>
              </Pressable>
              <Pressable onPress={() => void updateReminder(category.id, { minute: (val.minute + 5) % 60 })} style={styles.timeBtn}>
                <Text style={styles.timeText}>Min {String(val.minute).padStart(2, "0")}</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Text style={styles.section}>Items</Text>
        {items.map((item) => {
          const cats = getItemCategoryIds(item.id);
          return (
            <View key={item.id} style={styles.card}>
              {editingId === item.id ? (
                <>
                  <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" />
                  <TextInput value={unit} onChangeText={setUnit} style={styles.input} placeholder="Unit" />
                  <TextInput value={price} onChangeText={setPrice} style={styles.input} placeholder="Price" keyboardType="numeric" />
                  <View style={styles.chipsWrap}>
                    {categories.map((category) => (
                      <Pressable
                        key={category.id}
                        onPress={() => setSelected((s) => ({ ...s, [category.id]: !s[category.id] }))}
                        style={[styles.chip, selected[category.id] && styles.chipOn]}
                      >
                        <Text style={styles.chipText}>{category.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.btnRow}>
                    <Pressable
                      style={styles.btnSave}
                      onPress={() => {
                        editItem({
                          id: item.id,
                          name,
                          unit,
                          defaultPrice: Number(price) || 0,
                          categoryIds: editableCategoryIds
                        });
                        setEditingId(null);
                      }}
                    >
                      <Text style={styles.btnText}>Save</Text>
                    </Pressable>
                    <Pressable style={styles.btnGhost} onPress={() => setEditingId(null)}>
                      <Text style={styles.btnGhostText}>Cancel</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>{item.unit} • Price {item.defaultPrice ?? 0}</Text>
                  <View style={styles.btnRow}>
                    <Pressable
                      style={styles.btnGhost}
                      onPress={() => {
                        setEditingId(item.id);
                        setName(item.name);
                        setUnit(item.unit);
                        setPrice(String(item.defaultPrice ?? 0));
                        setSelected(Object.fromEntries(cats.map((c) => [c, true])));
                      }}
                    >
                      <Text style={styles.btnGhostText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.btnDanger} onPress={() => removeItem(item.id)}>
                      <Text style={styles.btnDangerText}>Delete</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          );
        })}
        <Text style={styles.section}>Data</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.btnGhost}
            onPress={async () => {
              try {
                const path = await exportBackup();
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(path);
                } else {
                  Alert.alert("Backup saved", `Saved to: ${path}`);
                }
              } catch (e) {
                Alert.alert("Backup failed", String(e));
              }
            }}
          >
            <Text style={styles.btnGhostText}>📤 Export Backup</Text>
          </Pressable>
          <Pressable
            style={styles.btnDanger}
            onPress={() => {
              Alert.alert(
                "Restore Backup",
                "To restore, copy your backup .sqlite file to the app's document directory and rename it to stock-reminder-backup.sqlite, then tap Restore.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Restore",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await restoreBackup(`${require("expo-file-system").documentDirectory}stock-reminder-backup.sqlite`);
                        hydrate();
                        Alert.alert("Restored", "Data restored successfully. Restart the app for changes to take effect.");
                      } catch (e) {
                        Alert.alert("Restore failed", String(e));
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.btnDangerText}>📥 Restore Backup</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  backText: { fontSize: 16, color: colors.blue, fontWeight: "700" },
  title: { fontSize: 30, fontWeight: "800", color: colors.textPrimary, flex: 1 },
  section: { marginTop: 8, marginBottom: 8, fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  list: { gap: 10, paddingBottom: 20 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 12, gap: 8 },
  linkRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  link: { color: colors.blue, fontWeight: "700" },
  name: { fontWeight: "700", color: colors.textPrimary, fontSize: 16 },
  meta: { color: colors.textSecondary },
  reminderRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  timeBtn: { backgroundColor: "#f2f2f2", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  timeText: { fontWeight: "600", color: colors.textPrimary },
  input: { backgroundColor: "#f3f3f3", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#f2f2f2", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipOn: { backgroundColor: colors.blue },
  chipText: { color: colors.textPrimary, fontWeight: "700" },
  btnRow: { flexDirection: "row", gap: 8 },
  btnSave: { backgroundColor: colors.teal, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
  btnGhost: { backgroundColor: "#f2f2f2", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  btnGhostText: { color: colors.textPrimary, fontWeight: "700" },
  btnDanger: { backgroundColor: "#ffe0e0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  btnDangerText: { color: "#c62828", fontWeight: "700" }
});
