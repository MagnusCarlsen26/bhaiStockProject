import { useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { useChecklistStore } from "@/features/dashboard/store";
import { colors, spacing } from "@/ui/theme/tokens";

type Row = { key: string; itemId: string; itemName: string; unit: string };

export default function ReorderCategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const id = categoryId ?? "";
  const categories = useChecklistStore((s) => s.categories);
  const entries = useChecklistStore((s) => s.entriesByCategory[id] ?? []);
  const setCategoryOrder = useChecklistStore((s) => s.setCategoryOrder);

  const [data, setData] = useState<Row[]>(
    entries.map((entry) => ({
      key: entry.itemId,
      itemId: entry.itemId,
      itemName: entry.itemName,
      unit: entry.unit
    }))
  );

  const title = useMemo(() => categories.find((c) => c.id === id)?.title ?? "Reorder", [categories, id]);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Row>) => (
    <View style={[styles.row, isActive && styles.rowActive]}>
      <Text onLongPress={drag} style={styles.drag}>≡</Text>
      <View>
        <Text style={styles.name}>{item.itemName}</Text>
        <Text style={styles.meta}>{item.unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.subtitle}>Long press drag handle to reorder priority.</Text>
      <DraggableFlatList
        data={data}
        keyExtractor={(item) => item.key}
        onDragEnd={({ data: next }) => {
          setData(next);
          setCategoryOrder(id, next.map((x) => x.itemId));
        }}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  backText: { fontSize: 16, color: colors.blue, fontWeight: "700" },
  title: { fontSize: 28, fontWeight: "800", color: colors.textPrimary, flex: 1 },
  subtitle: { marginTop: 6, marginBottom: 12, color: colors.textSecondary },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  rowActive: { opacity: 0.85 },
  drag: { fontSize: 24, color: colors.textSecondary, width: 20 },
  name: { fontWeight: "700", color: colors.textPrimary, fontSize: 16 },
  meta: { color: colors.textSecondary }
});
