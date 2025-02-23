import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import { useSubscription } from "../../contexts/SubscriptionContext";

type Props = ScreenProps<"SubscriptionPlans">;

type Plan = {
  id: string;
  name: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: string[];
  isPopular?: boolean;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: {
      monthly: 80,
      annual: 800,
    },
    features: [
      "Basic features access",
      "Standard support",
      "1 user account",
      "Basic analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: {
      monthly: 150,
      annual: 1500,
    },
    features: [
      "All Basic features",
      "Priority support",
      "5 user accounts",
      "Advanced analytics",
      "Custom integrations",
    ],
    isPopular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: {
      monthly: 300,
      annual: 3000,
    },
    features: [
      "All Pro features",
      "24/7 Premium support",
      "Unlimited user accounts",
      "Enterprise analytics",
      "Custom development",
      "Dedicated account manager",
    ],
  },
];

export default function SubscriptionPlansScreen({ navigation }: Props) {
  const [isAnnual, setIsAnnual] = useState(false);
  const { subscribeToPlan } = useSubscription();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnims = useRef(plans.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Fade in and slide up the content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      // Stagger the plan cards animation
      ...scaleAnims.map((anim, index) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: index * 100,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    try {
      await subscribeToPlan(plan, isAnnual ? "annual" : "monthly");
      navigation.navigate("PaymentProcess", { plan });
    } catch (error) {
      Alert.alert("Error", "Failed to subscribe to plan. Please try again.");
    }
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
        <Text style={styles.title}>Choose Your Plan</Text>
      </View>

      <Animated.View
        style={[
          styles.billingToggle,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.billingText}>Monthly</Text>
        <Switch
          value={isAnnual}
          onValueChange={setIsAnnual}
          trackColor={{
            false: theme.colors.secondary,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.background}
        />
        <Text style={styles.billingText}>Annual</Text>
        {isAnnual && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Save 20%</Text>
          </View>
        )}
      </Animated.View>

      <ScrollView style={styles.content}>
        {plans.map((plan, index) => (
          <Animated.View
            key={plan.id}
            style={[
              styles.planCard,
              plan.isPopular && styles.popularPlan,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnims[index] },
                ],
              },
            ]}
          >
            {plan.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>
              ₺{isAnnual ? plan.price.annual : plan.price.monthly}
              <Text style={styles.billingPeriod}>
                /{isAnnual ? "year" : "month"}
              </Text>
            </Text>
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                plan.isPopular && styles.popularButton,
              ]}
              onPress={() => handleSubscribe(plan)}
            >
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
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
  billingToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.colors.secondary,
  },
  billingText: {
    fontSize: 16,
    color: theme.colors.text,
    marginHorizontal: 8,
  },
  savingsBadge: {
    backgroundColor: theme.colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  savingsText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  planCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  popularPlan: {
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: "600",
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 16,
  },
  billingPeriod: {
    fontSize: 16,
    color: theme.colors.text + "80",
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
  },
  subscribeButton: {
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  popularButton: {
    backgroundColor: theme.colors.primary,
  },
  subscribeButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
