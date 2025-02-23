import { useEffect } from "react";
import { StyleSheet, View, Image, Animated, Dimensions } from "react-native";
import { theme } from "../theme";
import type { ScreenProps } from "../App";

type Props = ScreenProps<"Splash">;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const LOGO_RATIO = 2.5; // Width to height ratio of the logo
const LOGO_WIDTH = SCREEN_WIDTH * 2.4; // 70% of screen width
const LOGO_HEIGHT = LOGO_WIDTH / LOGO_RATIO;

export default function SplashScreen({ navigation }: Props) {
  const opacity = new Animated.Value(0);
  const progress = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      // Fade in logo
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Wait a bit
      Animated.delay(1000),
      // Progress bar animation
      Animated.timing(progress, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Wait before navigation
      Animated.delay(200),
    ]).start(() => {
      navigation.replace("Welcome");
    });
  }, []);

  const progressTransform = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Image
          source={require("../assets/images/logo.png")}
          style={[
            styles.logo,
            {
              opacity,
              width: LOGO_WIDTH,
              height: LOGO_HEIGHT,
            },
          ]}
          resizeMode="contain"
        />
      </View>
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              transform: [{ translateX: progressTransform }],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: SCREEN_HEIGHT * 0.1, // Offset logo slightly above center
  },
  logo: {
    // Base styles - actual dimensions set in style prop
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.secondary,
    overflow: "hidden",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "100%",
    width: SCREEN_WIDTH,
    backgroundColor: theme.colors.primary,
  },
});
