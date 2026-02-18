import { useMemo } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useChecklistStore } from "@/features/dashboard/store";
import { colors, radii, spacing } from "@/ui/theme/tokens";

export default function ChecklistScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const id = categoryId ?? "cat-daily";
  const categories = useChecklistStore((s) => s.categories);
  const entries = useChecklistStore((s) => s.entriesByCategory[id] ?? []);
  const toggleCheck = useChecklistStore((s) => s.toggleCheck);
  const upsertEntry = useChecklistStore((s) => s.upsertEntry);

  const categoryTitle = useMemo(
    () => categories.find((c) => c.id === id)?.title ?? "Checklist",
    [categories, id]
  );

  const unchecked = useMemo(
    () => [...entries].filter((e) => !e.isChecked).sort((a, b) => a.itemName.localeCompare(b.itemName)),
    [entries]
  );
  const checked = useMemo(
    () => [...entries].filter((e) => e.isChecked).sort((a, b) => a.itemName.localeCompare(b.itemName)),
    [entries]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.header}>{categoryTitle}</Text>
      </View>
      {unchecked.map((entry) => (
        <View key={entry.id} style={styles.row}>
          <Pressable onPress={() => toggleCheck(id, entry.id)} style={styles.check}>
            <Text>{entry.isChecked ? "✓" : ""}</Text>
          </Pressable>
          <View style={styles.meta}>
            <Text style={styles.name}>{entry.itemName}</Text>
            <Text style={styles.unit}>{entry.unit}</Text>
          </View>
          <View style={styles.stepperWrap}>
            <Pressable
              onPress={() => upsertEntry(id, { ...entry, quantity: Math.max(0, entry.quantity - 1) })}
              style={styles.stepBtn}
            >
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <TextInput
              value={String(entry.quantity)}
              keyboardType="numeric"
              onChangeText={(value) => upsertEntry(id, { ...entry, quantity: Number(value) || 0 })}
              style={styles.qty}
            />
            <Pressable
              onPress={() => upsertEntry(id, { ...entry, quantity: entry.quantity + 1 })}
              style={styles.stepBtn}
            >
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
          <TextInput
            value={String(entry.unitPrice ?? 0)}
            keyboardType="numeric"
            onChangeText={(value) => upsertEntry(id, { ...entry, unitPrice: Number(value) || 0 })}
            style={styles.price}
          />
        </View>
      ))}
      {checked.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>✓ Completed</Text>
          {checked.map((entry) => (
            <View key={entry.id} style={[styles.row, styles.rowDone]}>
              <Pressable onPress={() => toggleCheck(id, entry.id)} style={[styles.check, styles.checkDone]}>
                <Text style={styles.checkMark}>✓</Text>
              </Pressable>
              <View style={styles.meta}>
                <Text style={[styles.name, styles.nameDone]}>{entry.itemName}</Text>
                <Text style={styles.unit}>{entry.unit}</Text>
              </View>
              <Text style={styles.qtyDone}>{entry.quantity}</Text>
            </View>
          ))}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, gap: spacing.sm },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  backBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  backText: { fontSize: 16, color: colors.blue, fontWeight: "700" },
  header: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, flex: 1 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, marginTop: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#fff",
    borderRadius: radii.card,
    padding: spacing.sm
  },
  rowDone: { opacity: 0.6 },
  check: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  checkDone: { backgroundColor: colors.teal, borderColor: colors.teal },
  checkMark: { color: "#fff", fontWeight: "700" },
  meta: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  nameDone: { textDecorationLine: "line-through", color: colors.textSecondary },
  unit: { fontSize: 12, color: colors.textSecondary },
  stepperWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  stepBtn: {
    width: 28,
    height: 28,
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  stepText: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  qty: {
    width: 44,
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    textAlign: "center",
    paddingVertical: 6
  },
  qtyDone: { width: 44, textAlign: "center", color: colors.textSecondary },
  price: {
    width: 64,
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    textAlign: "center",
    paddingVertical: 6
  }
});

