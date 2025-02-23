import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { theme } from "../theme";
import { Ionicons } from "@expo/vector-icons";

type CreateProjectModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (project: { title: string; description: string }) => void;
};

export default function CreateProjectModal({
  visible,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (title.trim() && description.trim()) {
      onSubmit({ title, description });
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Project</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Project Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter project title"
                placeholderTextColor={theme.colors.text + "80"}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter project description"
                placeholderTextColor={theme.colors.text + "80"}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!title.trim() || !description.trim()) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!title.trim() || !description.trim()}
            >
              <Text style={styles.submitButtonText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "500",
  },
  input: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
}); 