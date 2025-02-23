import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";

type Props = ScreenProps<"Dashboard">;

type DashboardOption = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: (navigation: Props["navigation"]) => void;
  color?: string;
};

const dashboardOptions: DashboardOption[] = [
  {
    icon: "person-circle",
    label: "Profile",
    onPress: (navigation) => navigation.navigate("Profile"),
  },
  {
    icon: "settings-outline",
    label: "Settings",
    onPress: (navigation) => navigation.navigate("Settings"),
  },
  {
    icon: "notifications-outline",
    label: "Notifications",
    onPress: () => {
      // TODO: Implement notifications
    },
  },
  {
    icon: "help-circle-outline",
    label: "Help & Support",
    onPress: () => {
      // TODO: Implement help & support
    },
  },
  {
    icon: "information-circle-outline",
    label: "About",
    onPress: () => {
      // TODO: Implement about
    },
  },
  {
    icon: "log-out",
    label: "Logout",
    onPress: (navigation) => navigation.replace("Welcome"),
    color: theme.colors.accent,
  },
];

export default function DashboardScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <Ionicons name="sunny" size={24} color={theme.colors.primary} />
            <Text style={styles.welcomeText}>Welcome back!</Text>
          </View>
          <Text style={styles.welcomeSubtext}>
            What would you like to do today?
          </Text>
        </View>

        <View style={styles.optionsGrid}>
          {dashboardOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={styles.optionCard}
              onPress={() => option.onPress(navigation)}
            >
              <Ionicons
                name={option.icon}
                size={32}
                color={option.color || theme.colors.text}
              />
              <Text
                style={[
                  styles.optionLabel,
                  option.color && { color: option.color },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.colors.secondary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: theme.colors.secondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginLeft: 12,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: theme.colors.text + "80",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  optionCard: {
    width: "47%",
    aspectRatio: 1,
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionLabel: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
    textAlign: "center",
  },
}); 