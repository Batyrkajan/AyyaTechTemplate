import { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";

type Props = ScreenProps<"PaymentConfirmation">;

export default function PaymentConfirmationScreen({ navigation }: Props) {
  const checkmarkScale = new Animated.Value(0);
  const fadeIn = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.checkmarkContainer,
            { transform: [{ scale: checkmarkScale }] },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={120}
            color={theme.colors.primary}
          />
        </Animated.View>

        <Animated.View style={{ opacity: fadeIn }}>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.message}>
            Thank you for your subscription. Your payment has been processed
            successfully.
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>#123456789</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValue}>₺150.00</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>**** 1234</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Billing</Text>
              <Text style={styles.detailValue}>
                {new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.replace("Dashboard")}
          >
            <Text style={styles.buttonText}>Go to Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("TransactionHistory")}
          >
            <Text style={styles.secondaryButtonText}>View Transaction History</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  checkmarkContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: theme.colors.text + "CC",
    textAlign: "center",
    marginBottom: 32,
  },
  detailsCard: {
    backgroundColor: theme.colors.secondary,
    padding: 20,
    borderRadius: 16,
    width: "100%",
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.text + "80",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
}); 