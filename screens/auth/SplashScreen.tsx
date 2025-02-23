import { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Add pattern variations
const patterns = [
  'triangle',
  'square',
  'diamond',
  'ellipse',
  'star',
] as const;

export default function SplashScreen({ navigation }: ScreenProps<"Splash">) {
  // Add more animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const patternAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const loadingRotateAnim = useRef(new Animated.Value(0)).current;
  const loadingScaleAnim = useRef(new Animated.Value(1)).current;
  const patternRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Enhanced animations
    Animated.sequence([
      // Background pattern animations
      Animated.parallel([
        Animated.timing(patternAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(patternRotateAnim, {
              toValue: 1,
              duration: 20000,
              useNativeDriver: true,
            }),
            Animated.timing(patternRotateAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
      // Logo animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Enhanced loading animations
      Animated.parallel([
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(loadingRotateAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(loadingRotateAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(loadingScaleAnim, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(loadingScaleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(colorAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(colorAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: false,
            }),
          ])
        ),
      ]),
      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace("Welcome");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const patternRotation = patternRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['45deg', '405deg'],
  });

  const loadingRotation = loadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      theme.colors.primary + "10",
      theme.colors.accent + "10",
      theme.colors.primary + "10",
    ],
  });

  return (
    <View style={styles.container}>
      {/* Enhanced Background Pattern */}
      <Animated.View 
        style={[
          styles.patternContainer, 
          { 
            opacity: patternAnim,
            transform: [{ rotate: patternRotation }],
          }
        ]}
      >
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.patternRow}>
            {Array.from({ length: 5 }).map((_, colIndex) => {
              const patternIndex = (rowIndex + colIndex) % patterns.length;
              return (
                <Animated.View
                  key={`pattern-${rowIndex}-${colIndex}`}
                  style={[
                    styles.patternIcon,
                    { backgroundColor },
                  ]}
                >
                  <Ionicons
                    name={patterns[patternIndex]}
                    size={40}
                    color={theme.colors.text + "10"}
                  />
                </Animated.View>
              );
            })}
          </View>
        ))}
      </Animated.View>

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
              { rotate: spin },
            ],
          },
        ]}
      >
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
      </Animated.View>

      {/* Enhanced Loading Indicator */}
      <Animated.View 
        style={[
          styles.loadingContainer, 
          { 
            opacity: loadingAnim,
            transform: [
              { rotate: loadingRotation },
              { scale: loadingScaleAnim },
            ],
          }
        ]}
      >
        <LoadingIndicator 
          size={40} 
          color={colorAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [
              theme.colors.primary,
              theme.colors.accent,
              theme.colors.primary,
            ],
          })} 
        />
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
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
  },
  patternRow: {
    flexDirection: "row",
    gap: 20,
  },
  patternIcon: {
    margin: 10,
    padding: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoContainer: {
    padding: 20,
    borderRadius: SCREEN_WIDTH * 0.2,
    backgroundColor: theme.colors.secondary + "20",
  },
  logo: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    resizeMode: "contain",
  },
  loadingContainer: {
    position: "absolute",
    bottom: SCREEN_WIDTH * 0.2,
    padding: 16,
    borderRadius: SCREEN_WIDTH * 0.1,
    backgroundColor: theme.colors.secondary + "20",
  },
}); 