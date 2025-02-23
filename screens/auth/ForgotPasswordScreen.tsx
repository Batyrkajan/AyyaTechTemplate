import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { theme } from "../../theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { useState } from "react";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // TODO: Implement actual password reset logic
    Alert.alert(
      "Reset Link Sent",
      "A reset link has been sent to your email address.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Enter your registered email"
          placeholderTextColor={theme.colors.text + "80"}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.button, !email.trim() && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={!email.trim()}
        >
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 40,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    gap: 20,
  },
  input: {
    backgroundColor: theme.colors.secondary,
    padding: 15,
    borderRadius: 8,
    color: theme.colors.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: {
    color: theme.colors.text,
    fontSize: 14,
  },
}); 