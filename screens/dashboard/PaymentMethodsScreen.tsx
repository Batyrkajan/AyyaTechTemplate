import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";

export default function PaymentMethodsScreen({ navigation }: ScreenProps<"PaymentMethods">) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Payment Methods Screen</Text>
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