import { useState, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { theme } from "../../theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { AnimatedInput } from "../../components/AnimatedInput";
import { GoogleIcon, AppleIcon } from "../../assets/icons";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

function getPasswordStrength(password: string): {
  score: number;
  message: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const messages = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    theme.colors.accent,
    "#ff4444",
    "#ffbb33",
    "#00C851",
    "#007E33",
  ];

  return {
    score,
    message: messages[score - 1] || "Very Weak",
    color: colors[score - 1] || colors[0],
  };
}

export default function SignUpScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (passwordStrength.score < 3) {
      Alert.alert("Error", "Please choose a stronger password");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual signup logic
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigation.navigate("Dashboard");
    } catch (error) {
      Alert.alert("Error", "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <View style={styles.form}>
        <AnimatedInput
          icon="person"
          placeholder="Full Name"
          placeholderTextColor={theme.colors.text + "80"}
          value={fullName}
          onChangeText={setFullName}
          editable={!isLoading}
          autoCapitalize="words"
        />

        <AnimatedInput
          icon="mail"
          placeholder="Email"
          placeholderTextColor={theme.colors.text + "80"}
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View>
          <AnimatedInput
            icon="lock-closed"
            placeholder="Password"
            placeholderTextColor={theme.colors.text + "80"}
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            secureTextEntry
          />
          {password.length > 0 && (
            <View style={styles.strengthMeter}>
              <View
                style={[
                  styles.strengthBar,
                  { width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: passwordStrength.color },
                ]}
              />
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.message}
              </Text>
            </View>
          )}
        </View>

        <AnimatedInput
          icon="lock-closed"
          placeholder="Confirm Password"
          placeholderTextColor={theme.colors.text + "80"}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!isLoading}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Creating Account..." : "Join the Future"}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <GoogleIcon />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <AppleIcon />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  strengthMeter: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.secondary,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.secondary,
  },
  dividerText: {
    color: theme.colors.text,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  linkButton: {
    alignItems: "center",
    marginTop: 20,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
}); 