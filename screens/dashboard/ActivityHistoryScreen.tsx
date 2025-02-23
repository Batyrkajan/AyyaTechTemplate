import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";

export default function ActivityHistoryScreen({ navigation }: ScreenProps<"ActivityHistory">) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Activity History Screen</Text>
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