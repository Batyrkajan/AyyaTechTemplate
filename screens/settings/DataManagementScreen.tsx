import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";

type Props = ScreenProps<"DataManagement">;

type DownloadItem = {
  id: string;
  name: string;
  size: string;
  date: string;
};

export default function DataManagementScreen({ navigation }: Props) {
  const [downloads] = useState<DownloadItem[]>([
    {
      id: "1",
      name: "Profile Data",
      size: "2.3 MB",
      date: new Date().toISOString(),
    },
    // Add more downloaded items
  ]);

  const handleExportData = () => {
    Alert.alert("Coming Soon", "This feature is not yet available");
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the app cache?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => Alert.alert("Success", "Cache cleared successfully"),
        },
      ]
    );
  };

  const handleDeleteDownload = (id: string) => {
    Alert.alert(
      "Delete Download",
      "Are you sure you want to delete this download?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement delete logic
          },
        },
      ]
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
        <Text style={styles.title}>Data Management</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Export</Text>
          <TouchableOpacity style={styles.button} onPress={handleExportData}>
            <Text style={styles.buttonText}>Export My Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleClearCache}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Clear App Cache
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Downloads</Text>
          {downloads.map((item) => (
            <View key={item.id} style={styles.downloadItem}>
              <View style={styles.downloadInfo}>
                <Text style={styles.downloadName}>{item.name}</Text>
                <Text style={styles.downloadDetails}>
                  {item.size} • {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteDownload(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.accent} />
              </TouchableOpacity>
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
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    color: theme.colors.text,
  },
  downloadItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  downloadInfo: {
    flex: 1,
  },
  downloadName: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: 4,
  },
  downloadDetails: {
    fontSize: 14,
    color: theme.colors.text + "80",
  },
  deleteButton: {
    padding: 8,
  },
}); 