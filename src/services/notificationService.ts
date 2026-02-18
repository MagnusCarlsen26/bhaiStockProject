import * as Notifications from "expo-notifications";
import { ReminderConfig } from "@/domain/types";
import { getCategories } from "@/db/repository";

export const registerReminders = async (configs: ReminderConfig[]): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const categories = getCategories();
  const titleMap = new Map(categories.map((c) => [c.id, c.title]));

  for (const config of configs) {
    if (!config.enabled) {
      continue;
    }

    const categoryTitle = titleMap.get(config.categoryId) ?? config.categoryId;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Stock Reminder",
        body: `Time to update your ${categoryTitle}!`
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: config.hour,
        minute: config.minute
      }
    });
  }
};
