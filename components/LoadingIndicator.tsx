import { StyleSheet, View, Animated, Easing, ViewStyle } from "react-native";
import { theme } from "../theme";
import { useEffect, useRef } from "react";

interface LoadingIndicatorProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  fullscreen?: boolean;
}

export function LoadingIndicator({
  size = 40,
  color = theme.colors.primary,
  style,
  fullscreen = false,
}: LoadingIndicatorProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (fullscreen) {
    return (
      <View style={[styles.fullscreen, style]}>
        <LoadingIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderColor: color,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background + "CC",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  spinner: {
    borderWidth: 3,
    borderRadius: 50,
    borderTopColor: "transparent",
  },
}); 