import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { router } from "expo-router";
import { bootstrapDatabase } from "@/db/client";
import { getHistoryRows } from "@/db/repository";
import { useChecklistStore } from "@/features/dashboard/store";
import { exportCsvAndShare, exportXlsxAndShare } from "@/services/exportService";
import { summarizeReport } from "@/services/reportService";
import { reconcileResets } from "@/services/resetService";
import { CategoryCard } from "@/ui/components/CategoryCard";
import { colors, spacing } from "@/ui/theme/tokens";

export default function DashboardScreen() {
  const categories = useChecklistStore((s) => s.categories);
  const entriesByCategory = useChecklistStore((s) => s.entriesByCategory);
  const hydrate = useChecklistStore((s) => s.hydrate);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    const run = async () => {
      await bootstrapDatabase();
      reconcileResets(new Date());
      hydrate();
    };
    void run();
  }, [hydrate]);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, on]) => on).map(([id]) => id),
    [selected]
  );

  const inSelectionMode = selectedIds.length > 0;

  useEffect(() => {
    overlayOpacity.value = withTiming(inSelectionMode ? 0.28 : 0, { duration: 180 });
  }, [inSelectionMode, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value
  }));

  const exportSelected = async (format: "csv" | "xlsx") => {
    const history = getHistoryRows({ categoryIds: selectedIds, limit: 1000 });
    const summary = summarizeReport(history, { from: "", to: "", categoryIds: selectedIds });
    if (format === "csv") {
      await exportCsvAndShare(summary);
      return;
    }
    await exportXlsxAndShare(summary);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View pointerEvents="none" style={[styles.overlay, overlayStyle]} />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Stock Lists</Text>
        <View style={styles.actions}>
          {inSelectionMode ? (
            <>
              <Pressable onPress={() => void exportSelected("csv")} style={styles.actionBtn}><Text style={styles.actionText}>CSV</Text></Pressable>
              <Pressable onPress={() => void exportSelected("xlsx")} style={styles.actionBtn}><Text style={styles.actionText}>XLSX</Text></Pressable>
              <Pressable onPress={() => setSelected({})} style={styles.actionBtn}><Text style={styles.actionText}>Clear</Text></Pressable>
            </>
          ) : (
            <>
              <Pressable onPress={() => router.push("/items")} style={styles.actionBtn}><Text style={styles.actionText}>+ Item</Text></Pressable>
              <Pressable onPress={() => router.push("/settings")} style={styles.actionBtn}><Text style={styles.actionText}>Settings</Text></Pressable>
            </>
          )}
        </View>
      </View>
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const entries = entriesByCategory[item.id] ?? [];
          const pending = entries.filter((e) => !e.isChecked);
          const preview =
            pending.length === 0
              ? "All done! ✓"
              : pending.length <= 2
              ? pending.map((e) => e.itemName).join(", ")
              : `${pending
                  .slice(0, 2)
                  .map((e) => e.itemName)
                  .join(", ")} + ${pending.length - 2} more`;
          const isSelected = Boolean(selected[item.id]);
          return (
            <View style={styles.cell}>
              <Pressable
                onLongPress={() => setSelected((s) => ({ ...s, [item.id]: !s[item.id] }))}
                onPress={() =>
                  inSelectionMode
                    ? setSelected((s) => ({ ...s, [item.id]: !s[item.id] }))
                    : router.push(`/checklist/${item.id}`)
                }
              >
                <CategoryCard
                  title={item.title}
                  color={item.color}
                  subtitle={preview}
                  progressText={isSelected ? "Selected" : "Resets Midnight"}
                />
              </Pressable>
            </View>
          );
        }}
      />
      <View style={styles.footerRow}>
        <Pressable onPress={() => router.push("/reports")} style={styles.footerBtn}><Text style={styles.footerTxt}>Reports</Text></Pressable>
        <Pressable onPress={() => router.push("/settings")} style={styles.footerBtn}><Text style={styles.footerTxt}>Reminders</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 0
  },
  headerRow: {
    zIndex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: { fontSize: 34, fontWeight: "800", color: colors.textPrimary },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12 },
  actionText: { fontWeight: "700", color: colors.textPrimary },
  grid: { paddingHorizontal: spacing.md, paddingBottom: 10, gap: spacing.md },
  row: { gap: spacing.md },
  cell: { flex: 1, zIndex: 1 },
  footerRow: {
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md
  },
  footerBtn: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 12, alignItems: "center" },
  footerTxt: { fontWeight: "700", color: colors.textPrimary }
});
