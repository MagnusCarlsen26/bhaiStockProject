import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/ui/theme/tokens";

type Props = {
  title: string;
  color: string;
  subtitle: string;
  progressText: string;
};

export const CategoryCard = ({ title, color, subtitle, progressText }: Props) => {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{progressText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: spacing.md,
    minHeight: 150,
    justifyContent: "space-between"
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14
  },
  pill: {
    backgroundColor: colors.white,
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  pillText: {
    fontWeight: "600",
    color: colors.textPrimary
  }
});
