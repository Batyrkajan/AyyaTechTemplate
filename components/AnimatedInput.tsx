import { useEffect, useRef } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Animated,
  Easing,
} from "react-native";
import { theme } from "../theme";
import { Ionicons } from "@expo/vector-icons";

interface AnimatedInputProps extends TextInputProps {
  icon: keyof typeof Ionicons.glyphMap;
}

export function AnimatedInput({ icon, ...props }: AnimatedInputProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TextInput style={styles.input} {...props} />
      <Ionicons name={icon} size={20} color={theme.colors.text} style={styles.icon} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    color: theme.colors.text,
    fontSize: 16,
  },
  icon: {
    marginLeft: 10,
  },
}); 