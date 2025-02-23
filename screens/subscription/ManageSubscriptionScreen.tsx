import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import { useSubscription } from "../../contexts/SubscriptionContext";

type Props = ScreenProps<"ManageSubscription">;

type SubscriptionStatus = "active" | "expired" | "cancelled";

export default function ManageSubscriptionScreen({ navigation }: Props) {
  const {
    subscription: { currentPlan, status, nextBilling, billingCycle },
    cancelSubscription,
  } = useSubscription();

  // Animation values
  const fadeIn = new Animated.Value(0);
  const slideUp = new Animated.Value(50);
  const actionButtonScale = new Animated.Value(1);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(actionButtonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(actionButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleUpgrade = () => {
    navigation.navigate("SubscriptionPlans");
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.",
      [
        {
          text: "No, Keep It",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelSubscription();
              Alert.alert(
                "Subscription Cancelled",
                "Your subscription will remain active until the end of the current billing period."
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to cancel subscription. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Subscription</Text>
      </View>

      <ScrollView style={styles.content}>
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>
                {currentPlan?.name || "No Plan"} Plan
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      status === "active"
                        ? "#4CAF50" + "20"
                        : theme.colors.accent + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        status === "active" ? "#4CAF50" : theme.colors.accent,
                    },
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.planDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price</Text>
                <Text style={styles.detailValue}>
                  ₺{currentPlan?.price[billingCycle] || 0}/{billingCycle}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Billing</Text>
                <Text style={styles.detailValue}>
                  {nextBilling
                    ? new Date(nextBilling).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleUpgrade}
          >
            <Animated.View
              style={[
                styles.actionButtonContent,
                { transform: [{ scale: actionButtonScale }] },
              ]}
            >
              <Ionicons
                name="arrow-up-circle"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.actionButtonText}>Upgrade Plan</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleCancel}
          >
            <Animated.View
              style={[
                styles.actionButtonContent,
                { transform: [{ scale: actionButtonScale }] },
              ]}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={theme.colors.accent}
              />
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancel Subscription
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          }}
        >
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate("TransactionHistory")}
          >
            <Text style={styles.historyButtonText}>
              View Transaction History
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.colors.secondary,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 20,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  planDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary + "20",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: theme.colors.accent + "20",
  },
  cancelButtonText: {
    color: theme.colors.accent,
  },
  historyButton: {
    padding: 16,
    alignItems: "center",
  },
  historyButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
});
