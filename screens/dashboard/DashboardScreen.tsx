import { StyleSheet, View, Text } from "react-native";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";

type Props = ScreenProps<"Dashboard">;

export default function DashboardScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  text: {
    color: theme.colors.text,
    fontSize: 20,
  },
}); 