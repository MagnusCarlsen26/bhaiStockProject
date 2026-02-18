import { useMemo, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { getHistoryRows } from "@/db/repository";
import { exportCsvAndShare, exportXlsxAndShare } from "@/services/exportService";
import { summarizeReport } from "@/services/reportService";
import { colors, spacing } from "@/ui/theme/tokens";

type FilterKey = "all" | "last30" | "year" | "custom";

type PickerTarget = "from" | "to" | null;

export default function ReportsScreen() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [fromDate, setFromDate] = useState<Date>(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000));
  const [toDate, setToDate] = useState<Date>(new Date());
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const rows = useMemo(() => {
    const now = new Date();
    let from: string | undefined;
    let to: string | undefined = now.toISOString();

    if (filter === "last30") {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (filter === "year") {
      from = new Date(now.getFullYear(), 0, 1).toISOString();
    } else if (filter === "custom") {
      const fromStart = new Date(fromDate);
      fromStart.setHours(0, 0, 0, 0);
      const toEnd = new Date(toDate);
      toEnd.setHours(23, 59, 59, 999);
      from = fromStart.toISOString();
      to = toEnd.toISOString();
    }

    const history = getHistoryRows({ from, to, limit: 1000 });
    return summarizeReport(history, { from: from ?? "", to: to ?? "" });
  }, [filter, fromDate, toDate]);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setPickerTarget(null);
      return;
    }
    if (!date || !pickerTarget) {
      setPickerTarget(null);
      return;
    }

    if (pickerTarget === "from") {
      setFromDate(date);
    } else {
      setToDate(date);
    }
    setPickerTarget(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Reports</Text>
      </View>
      <Text style={styles.subtitle}>Quantity, frequency, and cost summary</Text>
      <View style={styles.filters}>
        {[
          { id: "all", label: "All" },
          { id: "last30", label: "Last 30D" },
          { id: "year", label: "This Year" },
          { id: "custom", label: "Custom" }
        ].map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setFilter(option.id as FilterKey)}
            style={[styles.filterBtn, filter === option.id && styles.filterBtnActive]}
          >
            <Text style={styles.btnTxt}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      {filter === "custom" ? (
        <View style={styles.customRange}>
          <Pressable style={styles.dateBtn} onPress={() => setPickerTarget("from")}>
            <Text style={styles.btnTxt}>From {fromDate.toISOString().slice(0, 10)}</Text>
          </Pressable>
          <Pressable style={styles.dateBtn} onPress={() => setPickerTarget("to")}>
            <Text style={styles.btnTxt}>To {toDate.toISOString().slice(0, 10)}</Text>
          </Pressable>
        </View>
      ) : null}

      {pickerTarget ? (
        <DateTimePicker
          value={pickerTarget === "from" ? fromDate : toDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      ) : null}

      <View style={styles.actions}>
        <Pressable onPress={() => void exportCsvAndShare(rows)} style={styles.btn}><Text style={styles.btnTxt}>Export CSV</Text></Pressable>
        <Pressable onPress={() => void exportXlsxAndShare(rows)} style={styles.btn}><Text style={styles.btnTxt}>Export XLSX</Text></Pressable>
      </View>
      <View style={styles.list}>
        {rows.length === 0 ? <Text style={styles.empty}>No history for current filter.</Text> : null}
        {rows.map((row) => (
          <View key={row.itemId} style={styles.row}>
            <Text style={styles.name}>{row.itemName}</Text>
            <Text style={styles.meta}>Qty {row.totalQuantity} • Freq {row.frequency} • Cost {row.totalCost.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  backText: { fontSize: 16, color: colors.blue, fontWeight: "700" },
  title: { fontSize: 32, fontWeight: "800", color: colors.textPrimary, flex: 1 },
  subtitle: { color: colors.textSecondary, marginTop: 6 },
  filters: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  filterBtn: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  filterBtnActive: { backgroundColor: colors.blue },
  customRange: { flexDirection: "row", gap: 8, marginTop: 10 },
  dateBtn: { flex: 1, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10 },
  actions: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 8 },
  btn: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  btnTxt: { fontWeight: "700", color: colors.textPrimary },
  list: { marginTop: 8, gap: 10 },
  row: { backgroundColor: "#fff", borderRadius: 14, padding: 12 },
  name: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  meta: { marginTop: 2, color: colors.textSecondary },
  empty: { color: colors.textSecondary }
});
