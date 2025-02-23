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
import { AnimatedInput } from "../../components/AnimatedInput";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import type { ScreenProps } from "../../App";
import type { ProfileUpdateData } from "../../types/user";

type Props = ScreenProps<"EditProfile">;

export default function EditProfileScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    bio: "",
  });

  const handleSave = async () => {
    if (!formData.fullName?.trim() || !formData.email?.trim()) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual update logic
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.form}>
        <AnimatedInput
          icon="person"
          placeholder="Full Name"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          editable={!isLoading}
        />

        <AnimatedInput
          icon="mail"
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          editable={!isLoading}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AnimatedInput
          icon="call"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
          editable={!isLoading}
          keyboardType="phone-pad"
        />

        <AnimatedInput
          icon="document-text"
          placeholder="Bio"
          value={formData.bio}
          onChangeText={(text) => setFormData({ ...formData, bio: text })}
          editable={!isLoading}
          multiline
          numberOfLines={4}
          style={styles.bioInput}
        />

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingIndicator size={24} color={theme.colors.background} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
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
  form: {
    padding: 20,
    gap: 20,
  },
  bioInput: {
    height: 120,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
}); 