import { useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }: ScreenProps<"Welcome">) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonSlideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo and text animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Buttons animation
      Animated.timing(buttonSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={styles.patternRow}>
            {Array.from({ length: 10 }).map((_, j) => (
              <View
                key={`${i}-${j}`}
                style={[
                  styles.patternDot,
                  {
                    opacity: ((i + j) % 2 === 0 ? 0.1 : 0.05),
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to App</Text>
        <Text style={styles.subtitle}>
          Your journey begins here. Sign in to continue or create a new account.
        </Text>
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ translateY: buttonSlideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.signUpText}>Create Account</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  patternRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  patternDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    margin: 12,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  logo: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    resizeMode: "contain",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text + "80",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    paddingHorizontal: 24,
    gap: 16,
  },
  signInButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  signInText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  signUpButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  signUpText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
}); 