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
import { AnimatedInput } from "../../components/AnimatedInput";
import type { ScreenProps } from "../../App";
import { useSettings } from "../../contexts/SettingsContext";

type Props = ScreenProps<"GeneralSettings">;

type Language = {
  code: string;
  name: string;
};

const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  // Add more languages as needed
];

const themeAccents = [
  { id: "blue", color: theme.colors.primary },
  { id: "purple", color: "#9C27B0" },
  { id: "green", color: "#4CAF50" },
];

export default function GeneralSettingsScreen({ navigation }: Props) {
  const {
    language,
    darkMode,
    accentColor,
    autoUpdate,
    setLanguage,
    setDarkMode,
    setAccentColor,
    setAutoUpdate,
  } = useSettings();

  const handleSave = () => {
    // Settings are automatically saved through context
    navigation.goBack();
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
        <Text style={styles.title}>General Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.languageSelector}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.selectedLanguage,
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text
                  style={[
                    styles.languageText,
                    language === lang.code && styles.selectedLanguageText,
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={(value) => setDarkMode(value)}
              trackColor={{
                false: theme.colors.secondary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.background}
            />
          </View>
          <Text style={styles.settingSubtitle}>Accent Color</Text>
          <View style={styles.accentColors}>
            {themeAccents.map((accent) => (
              <TouchableOpacity
                key={accent.id}
                style={[styles.accentColor, { backgroundColor: accent.color }]}
                onPress={() => setAccentColor(accent.id)}
              >
                {accentColor === accent.id && (
                  <Ionicons name="checkmark" size={24} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Updates</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Automatic Updates</Text>
            <Switch
              value={autoUpdate}
              onValueChange={(value) => setAutoUpdate(value)}
              trackColor={{
                false: theme.colors.secondary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.text + "80",
    marginBottom: 12,
  },
  languageSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  languageOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
  },
  selectedLanguage: {
    backgroundColor: theme.colors.primary,
  },
  languageText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  selectedLanguageText: {
    color: theme.colors.background,
    fontWeight: "600",
  },
  accentColors: {
    flexDirection: "row",
    gap: 16,
  },
  accentColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
}); 