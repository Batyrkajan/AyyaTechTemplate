import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import { theme } from "../theme";
import type { ScreenProps } from "../App";

type Props = ScreenProps<"Welcome">;

export default function HomeScreen({ navigation }: Props) {
  const handlePress = (buttonScale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loginScale = new Animated.Value(1);
  const signupScale = new Animated.Value(1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Ayya</Text>
      <Text style={styles.subtitle}>Your Gateway to Future</Text>

      <View style={styles.buttonContainer}>
        <Animated.View
          style={[styles.buttonWrapper, { transform: [{ scale: loginScale }] }]}
        >
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => {
              handlePress(loginScale);
              navigation.navigate("Login");
            }}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonWrapper,
            { transform: [{ scale: signupScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => {
              handlePress(signupScale);
              navigation.navigate("SignUp");
            }}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
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
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 60,
  },
  buttonContainer: {
    width: "100%",
    gap: 20,
  },
  buttonWrapper: {
    width: "100%",
  },
  loginButton: {
    backgroundColor: theme.colors.text,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "transparent",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  signupButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
});
