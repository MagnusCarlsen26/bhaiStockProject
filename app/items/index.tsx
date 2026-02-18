import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useChecklistStore } from "@/features/dashboard/store";
import { colors, spacing } from "@/ui/theme/tokens";

export default function ItemsScreen() {
  const categories = useChecklistStore((s) => s.categories);
  const addItem = useChecklistStore((s) => s.addItem);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Add New Item</Text>
      </View>
      <TextInput value={name} onChangeText={setName} placeholder="Item name" style={styles.input} />
      <TextInput value={unit} onChangeText={setUnit} placeholder="Unit (kg, L, pcs)" style={styles.input} />
      <TextInput value={price} onChangeText={setPrice} placeholder="Default price" keyboardType="numeric" style={styles.input} />

      <Text style={styles.section}>Assign schedules</Text>
      <View style={styles.chipsWrap}>
        {categories.map((category) => {
          const isOn = Boolean(selected[category.id]);
          return (
            <Pressable
              key={category.id}
              onPress={() => setSelected((s) => ({ ...s, [category.id]: !s[category.id] }))}
              style={[styles.chip, isOn && styles.chipOn]}
            >
              <Text style={styles.chipText}>{category.title}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => {
          if (!name.trim() || !unit.trim() || selectedIds.length === 0) {
            return;
          }
          addItem({
            name: name.trim(),
            unit: unit.trim(),
            defaultPrice: Number(price) || 0,
            categoryIds: selectedIds
          });
          setName("");
          setUnit("");
          setPrice("");
          setSelected({});
        }}
        style={styles.addBtn}
      >
        <Text style={styles.addBtnText}>Add Item</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  backBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  backText: { fontSize: 16, color: colors.blue, fontWeight: "700" },
  title: { fontSize: 30, fontWeight: "800", color: colors.textPrimary, flex: 1 },
  input: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  section: { marginTop: 6, fontWeight: "700", color: colors.textPrimary },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.blue },
  chipText: { fontWeight: "700", color: colors.textPrimary },
  addBtn: { marginTop: 8, backgroundColor: colors.teal, borderRadius: 14, padding: 14, alignItems: "center" },
  addBtnText: { fontWeight: "800", color: "#fff" }
});
