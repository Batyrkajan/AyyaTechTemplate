import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import { useSettings } from "../../contexts/SettingsContext";

type Props = ScreenProps<"NotificationSettings">;

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: "push" | "email";
};

export default function NotificationSettingsScreen({ navigation }: Props) {
  const {
    notifications: { push, email, sound },
    setNotifications,
  } = useSettings();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "app_updates",
      title: "App Updates",
      description: "Get notified about new features and improvements",
      enabled: push,
      type: "push",
    },
    {
      id: "messages",
      title: "Messages",
      description: "Receive real-time chat notifications",
      enabled: push,
      type: "push",
    },
    {
      id: "reminders",
      title: "Reminders",
      description: "Get notified about tasks and events",
      enabled: push,
      type: "push",
    },
    {
      id: "email_updates",
      title: "Email Updates",
      description: "Receive important updates via email",
      enabled: email,
      type: "email",
    },
    {
      id: "email_newsletter",
      title: "Newsletter",
      description: "Stay updated with our monthly newsletter",
      enabled: email,
      type: "email",
    },
  ]);

  const handleToggle = (id: string) => {
    const setting = settings.find((s) => s.id === id);
    if (setting) {
      if (setting.type === "push") {
        setNotifications({ push: !setting.enabled });
      } else if (setting.type === "email") {
        setNotifications({ email: !setting.enabled });
      }
      setSettings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
      );
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
        <Text style={styles.title}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          {settings
            .filter((s) => s.type === "push")
            .map((setting) => (
              <View key={setting.id} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => handleToggle(setting.id)}
                  trackColor={{
                    false: theme.colors.secondary,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.background}
                />
              </View>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          {settings
            .filter((s) => s.type === "email")
            .map((setting) => (
              <View key={setting.id} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => handleToggle(setting.id)}
                  trackColor={{
                    false: theme.colors.secondary,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.background}
                />
              </View>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound Settings</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notification Sound</Text>
              <Text style={styles.settingDescription}>
                Play sound for notifications
              </Text>
            </View>
            <Switch
              value={sound}
              onValueChange={(value) => setNotifications({ sound: value })}
              trackColor={{
                false: theme.colors.secondary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.text + "80",
  },
}); 