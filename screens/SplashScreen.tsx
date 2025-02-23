import { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import { theme } from "../theme";
import type { ScreenProps } from "../App";

type Props = ScreenProps<"Splash">;

export default function SplashScreen({ navigation }: Props) {
  const logoScale = new Animated.Value(0.5);
  const logoOpacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate to Welcome screen after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace("Welcome");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        {/* Replace with actual logo */}
        <View style={styles.logo} />
        <Text style={styles.tagline}>Powering the Future of Innovation</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.primary,
    borderRadius: 60,
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  tagline: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 20,
  },
});
