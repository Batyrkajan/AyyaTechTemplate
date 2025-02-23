import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import type { ScreenProps } from "../../App";
import type { UserProfile, ActivityLog } from "../../types/user";

type Props = ScreenProps<"Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  return (
    <ScrollView style={styles.container}>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.pictureContainer}>
              {profile?.profilePicture ? (
                <Image
                  source={{ uri: profile.profilePicture }}
                  style={styles.profilePicture}
                />
              ) : (
                <View style={[styles.profilePicture, styles.placeholderPicture]}>
                  <Ionicons name="person" size={40} color={theme.colors.text} />
                </View>
              )}
              <View style={styles.progressRing}>
                <Text style={styles.progressText}>{`${profile?.completionPercentage ?? 0}%`}</Text>
              </View>
            </View>

            <Text style={styles.name}>{profile?.fullName ?? "User"}</Text>
            <Text style={styles.email}>{profile?.email}</Text>
            <Text style={styles.joinDate}>
              Member since {new Date(profile?.createdAt ?? Date.now()).toLocaleDateString()}
            </Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {activities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Ionicons
                  name={getActivityIcon(activity.type)}
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <Text style={styles.activityTime}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function getActivityIcon(type: ActivityLog["type"]): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "login":
      return "log-in-outline";
    case "profile_update":
      return "person-outline";
    case "settings_change":
      return "settings-outline";
    default:
      return "ellipse-outline";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    alignItems: "center",
    padding: 20,
    marginHorizontal: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pictureContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderPicture: {
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRing: {
    position: "absolute",
    right: -10,
    bottom: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: theme.colors.text + "80",
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: theme.colors.text + "60",
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  activitySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.text + "60",
  },
}); 