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
import { useSettings } from "../../contexts/SettingsContext";

type Props = ScreenProps<"PrivacySettings">;

type Permission = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

export default function PrivacySettingsScreen({ navigation }: Props) {
  const {
    privacy: { dataSharing, analytics },
    setPrivacy,
  } = useSettings();

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "camera",
      title: "Camera Access",
      description: "Allow app to use your camera for profile pictures",
      enabled: true,
    },
    {
      id: "location",
      title: "Location Services",
      description: "Allow app to access your location",
      enabled: false,
    },
    {
      id: "notifications",
      title: "Push Notifications",
      description: "Allow app to send you notifications",
      enabled: true,
    },
  ]);

  const handlePermissionToggle = (id: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This action is irreversible.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            navigation.navigate("Welcome");
          },
        },
      ],
      { cancelable: true }
    );
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
        <Text style={styles.title}>Privacy Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Permissions</Text>
          {permissions.map((permission) => (
            <View key={permission.id} style={styles.permissionItem}>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>{permission.title}</Text>
                <Text style={styles.permissionDescription}>
                  {permission.description}
                </Text>
              </View>
              <Switch
                value={permission.enabled}
                onValueChange={() => handlePermissionToggle(permission.id)}
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
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Analytics</Text>
              <Text style={styles.settingDescription}>
                Help us improve by sharing usage data
              </Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={(value) => setPrivacy({ analytics: value })}
              trackColor={{
                false: theme.colors.secondary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.background}
            />
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Third-Party Services</Text>
              <Text style={styles.settingDescription}>
                Share data with our partners
              </Text>
            </View>
            <Switch
              value={dataSharing}
              onValueChange={(value) => setPrivacy({ dataSharing: value })}
              trackColor={{
                false: theme.colors.secondary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Alert.alert("Coming Soon", "This feature is not yet available")}
          >
            <Text style={styles.buttonText}>Download My Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.buttonText, styles.deleteButtonText]}>
              Delete Account
            </Text>
          </TouchableOpacity>
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
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionInfo: {
    flex: 1,
    marginRight: 16,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: theme.colors.text + "80",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.text + "80",
    maxWidth: "80%",
  },
  button: {
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: theme.colors.accent + "20",
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  deleteButtonText: {
    color: theme.colors.accent,
  },
}); 