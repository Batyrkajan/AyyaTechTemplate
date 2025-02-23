import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";

export default function UsageStatsScreen({ navigation }: ScreenProps<"UsageStats">) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Usage Stats Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  text: {
    color: theme.colors.text,
    fontSize: 18,
  },
}); 