import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_PERMISSION_KEY = 'notification_permission_asked';
const END_OF_MONTH_NOTIFICATION_KEY = 'end_of_month_notification';
const STREAK_REMINDER_KEY = 'streak_reminder_notification';

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B95F',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
  
  return finalStatus === 'granted';
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule end-of-month reminder
 * Reminds user on the 28th of each month at 10 AM to log their trading results
 */
export async function scheduleEndOfMonthReminder(): Promise<string | null> {
  const granted = await areNotificationsEnabled();
  if (!granted) return null;

  // Cancel existing end-of-month notification
  await cancelEndOfMonthReminder();

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Time to Log Your Month!',
      body: "The month is ending soon. Don't forget to record your trading results!",
      data: { type: 'end_of_month' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
      day: 28,
      hour: 10,
      minute: 0,
    },
  });

  await AsyncStorage.setItem(END_OF_MONTH_NOTIFICATION_KEY, identifier);
  return identifier;
}

/**
 * Cancel end-of-month reminder
 */
export async function cancelEndOfMonthReminder(): Promise<void> {
  const existingId = await AsyncStorage.getItem(END_OF_MONTH_NOTIFICATION_KEY);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId);
    await AsyncStorage.removeItem(END_OF_MONTH_NOTIFICATION_KEY);
  }
}

/**
 * Schedule streak reminder
 * If user has a profit streak, remind them daily at 9 AM to keep it going
 */
export async function scheduleStreakReminder(streakCount: number): Promise<string | null> {
  const granted = await areNotificationsEnabled();
  if (!granted || streakCount < 2) return null;

  // Cancel existing streak reminder
  await cancelStreakReminder();

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🔥 ${streakCount}-Month Profit Streak!`,
      body: "Keep your winning streak going! Stay focused on your trading plan.",
      data: { type: 'streak_reminder', streak: streakCount },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });

  await AsyncStorage.setItem(STREAK_REMINDER_KEY, identifier);
  return identifier;
}

/**
 * Cancel streak reminder
 */
export async function cancelStreakReminder(): Promise<void> {
  const existingId = await AsyncStorage.getItem(STREAK_REMINDER_KEY);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId);
    await AsyncStorage.removeItem(STREAK_REMINDER_KEY);
  }
}

/**
 * Send immediate test notification
 */
export async function sendTestNotification(): Promise<void> {
  const granted = await areNotificationsEnabled();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Notifications Enabled!',
      body: 'You will now receive reminders to log your monthly trading results.',
      sound: true,
    },
    trigger: null, // Immediate
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(END_OF_MONTH_NOTIFICATION_KEY);
  await AsyncStorage.removeItem(STREAK_REMINDER_KEY);
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
