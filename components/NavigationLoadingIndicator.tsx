import { StyleSheet, View, Animated, Dimensions } from "react-native";
import { theme } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function NavigationLoadingIndicator() {
  const progress = new Animated.Value(0);

  Animated.loop(
    Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ])
  ).start();

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Animated.View
          style={[
            styles.progress,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.secondary,
    overflow: "hidden",
  },
  bar: {
    flex: 1,
  },
  progress: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "100%",
    width: SCREEN_WIDTH,
    backgroundColor: theme.colors.primary,
  },
}); 