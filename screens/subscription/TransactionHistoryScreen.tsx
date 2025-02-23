import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import { useSubscription } from "../../contexts/SubscriptionContext";

type Props = ScreenProps<"TransactionHistory">;

type Transaction = {
  id: string;
  date: string;
  amount: number;
  status: "success" | "pending" | "failed";
  paymentMethod: string;
  description: string;
};

const transactions: Transaction[] = [
  {
    id: "TX123456",
    date: new Date().toISOString(),
    amount: 150,
    status: "success",
    paymentMethod: "**** 1234",
    description: "Pro Plan Subscription",
  },
  // Add more transactions here
];

export default function TransactionHistoryScreen({ navigation }: Props) {
  const {
    subscription: { transactions },
    getTransactionHistory,
  } = useSubscription();
  const [loading, setLoading] = useState(false);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      await getTransactionHistory();
    } catch (error) {
      Alert.alert("Error", "Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return "#4CAF50";
      case "pending":
        return "#FFC107";
      case "failed":
        return theme.colors.accent;
      default:
        return theme.colors.text;
    }
  };

  const handleDownloadInvoice = (transactionId: string) => {
    Alert.alert("Coming Soon", "This feature is not yet available");
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
        <Text style={styles.title}>Transaction History</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadTransactions}
            tintColor={theme.colors.primary}
          />
        }
      >
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionId}>#{transaction.id}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusColor(transaction.status) + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(transaction.status) },
                  ]}
                >
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{transaction.description}</Text>

            <View style={styles.detailsContainer}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>₺{transaction.amount}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>
                  {transaction.paymentMethod}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownloadInvoice(transaction.id)}
            >
              <Ionicons
                name="download-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.downloadButtonText}>Download Invoice</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  transactionCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: "600",
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
  description: {
    fontSize: 14,
    color: theme.colors.text + "CC",
    marginBottom: 16,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.text + "80",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + "20",
  },
  downloadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
});
