import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";

type Props = ScreenProps<"Settings">;

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  type: "toggle" | "button" | "link";
  value?: boolean;
  onPress?: () => void;
  danger?: boolean;
};

export default function SettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState({
    darkMode: true,
    pushNotifications: true,
    emailNotifications: false,
    dataSharing: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsItems: SettingItem[] = [
    {
      icon: "moon",
      title: "Dark Mode",
      type: "toggle",
      value: settings.darkMode,
      onPress: () => handleToggle("darkMode"),
    },
    {
      icon: "notifications",
      title: "Push Notifications",
      type: "toggle",
      value: settings.pushNotifications,
      onPress: () => handleToggle("pushNotifications"),
    },
    {
      icon: "mail",
      title: "Email Notifications",
      type: "toggle",
      value: settings.emailNotifications,
      onPress: () => handleToggle("emailNotifications"),
    },
    {
      icon: "share",
      title: "Data Sharing",
      type: "toggle",
      value: settings.dataSharing,
      onPress: () => handleToggle("dataSharing"),
    },
    {
      icon: "key",
      title: "Change Password",
      type: "link",
      onPress: () => Alert.alert("Coming Soon", "This feature is not yet available"),
    },
    {
      icon: "cloud-download",
      title: "Download My Data",
      type: "button",
      onPress: () => Alert.alert("Coming Soon", "This feature is not yet available"),
    },
    {
      icon: "trash",
      title: "Delete Account",
      type: "button",
      danger: true,
      onPress: () =>
        Alert.alert(
          "Delete Account",
          "Are you sure you want to delete your account? This action cannot be undone.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => Alert.alert("Coming Soon", "This feature is not yet available"),
            },
          ]
        ),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.settingsList}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            style={[
              styles.settingItem,
              index === settingsItems.length - 1 && styles.lastItem,
              item.danger && styles.dangerItem,
            ]}
            onPress={item.onPress}
            disabled={item.type === "toggle"}
          >
            <View style={styles.settingContent}>
              <Ionicons
                name={item.icon}
                size={24}
                color={item.danger ? theme.colors.accent : theme.colors.text}
              />
              <Text
                style={[
                  styles.settingTitle,
                  item.danger && styles.dangerText,
                ]}
              >
                {item.title}
              </Text>
            </View>
            {item.type === "toggle" && (
              <Switch
                value={item.value}
                onValueChange={item.onPress}
                trackColor={{
                  false: theme.colors.secondary,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.background}
              />
            )}
            {item.type === "link" && (
              <Ionicons
                name="chevron-forward"
                size={24}
                color={theme.colors.text}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginLeft: 16,
  },
  settingsList: {
    padding: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  dangerItem: {
    marginTop: 20,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingTitle: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 16,
  },
  dangerText: {
    color: theme.colors.accent,
  },
}); 