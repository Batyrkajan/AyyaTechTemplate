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
import { AnimatedInput } from "../../components/AnimatedInput";
import type { ScreenProps } from "../../App";

type Props = ScreenProps<"SecuritySettings">;

type LoginHistory = {
  id: string;
  device: string;
  location: string;
  timestamp: string;
};

export default function SecuritySettingsScreen({ navigation }: Props) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [loginHistory] = useState<LoginHistory[]>([
    {
      id: "1",
      device: "iPhone 13",
      location: "New York, USA",
      timestamp: new Date().toISOString(),
    },
    // Add more login history items
  ]);

  const handleChangePassword = () => {
    // TODO: Implement password change logic
    Alert.alert("Coming Soon", "This feature is not yet available");
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      Alert.alert(
        "Enable 2FA",
        "You'll need to verify your phone number to enable two-factor authentication.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            onPress: () => setTwoFactorEnabled(true),
          },
        ]
      );
    } else {
      setTwoFactorEnabled(false);
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
        <Text style={styles.title}>Security Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleChangePassword}
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable 2FA</Text>
              <Text style={styles.settingDescription}>
                Add an extra layer of security to your account
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleTwoFactorToggle}
              trackColor={{
                false: theme.colors.secondary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Alerts</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Unusual Activity</Text>
              <Text style={styles.settingDescription}>
                Get notified about suspicious login attempts
              </Text>
            </View>
            <Switch
              value={securityAlerts}
              onValueChange={setSecurityAlerts}
              trackColor={{
                false: theme.colors.secondary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Login Activity</Text>
          {loginHistory.map((login) => (
            <View key={login.id} style={styles.loginItem}>
              <View style={styles.loginInfo}>
                <Text style={styles.loginDevice}>{login.device}</Text>
                <Text style={styles.loginLocation}>{login.location}</Text>
                <Text style={styles.loginTime}>
                  {new Date(login.timestamp).toLocaleString()}
                </Text>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.colors.primary}
              />
            </View>
          ))}
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
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "600",
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
  loginItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  loginInfo: {
    flex: 1,
  },
  loginDevice: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: 4,
  },
  loginLocation: {
    fontSize: 14,
    color: theme.colors.text + "80",
    marginBottom: 4,
  },
  loginTime: {
    fontSize: 12,
    color: theme.colors.text + "60",
  },
}); 