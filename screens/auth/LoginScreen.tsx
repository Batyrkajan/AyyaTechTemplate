import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { theme } from "../../theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { Ionicons } from "@expo/vector-icons";
import { GoogleIcon, AppleIcon } from "../../assets/icons";
import { AnimatedInput } from "../../components/AnimatedInput";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual login logic
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      navigation.navigate("Dashboard");
    } catch (error) {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to Your Account</Text>

      <View style={styles.form}>
        <AnimatedInput
          icon="mail"
          placeholder="Email"
          placeholderTextColor={theme.colors.text + "80"}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />

        <AnimatedInput
          icon="lock-closed"
          placeholder="Password"
          placeholderTextColor={theme.colors.text + "80"}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
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
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
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
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: theme.colors.text,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
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
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  linkButton: {
    alignItems: "center",
    marginTop: 20,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
