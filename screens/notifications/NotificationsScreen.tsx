import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";

type Props = ScreenProps<"Notifications">;

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
};

export default function NotificationsScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Welcome to the App!",
      message: "Thanks for joining us. We're excited to have you on board.",
      timestamp: new Date().toISOString(),
      type: "success",
      read: false,
    },
    // Add more sample notifications here
  ]);

  const handleRefresh = () => {
    setRefreshing(true);
    // TODO: Implement actual refresh logic
    setTimeout(() => setRefreshing(false), 1500);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIconName = (type: Notification["type"]): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "warning":
        return "warning";
      case "error":
        return "alert-circle";
      default:
        return "information-circle";
    }
  };

  const getIconColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "warning":
        return "#FFC107";
      case "error":
        return theme.colors.accent;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off"
              size={48}
              color={theme.colors.text + "40"}
            />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                notification.read && styles.readNotification,
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <Ionicons
                name={getIconName(notification.type)}
                size={24}
                color={getIconColor(notification.type)}
              />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>
                  {new Date(notification.timestamp).toLocaleString()}
                </Text>
              </View>
              {!notification.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.colors.secondary,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text + "40",
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    marginBottom: 12,
  },
  readNotification: {
    opacity: 0.7,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.text + "CC",
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.text + "80",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
    marginTop: 8,
  },
}); 