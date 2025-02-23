import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

type Transaction = {
  id: string;
  date: string;
  amount: number;
  status: "success" | "pending" | "failed";
  paymentMethod: string;
  description: string;
};

type SubscriptionStatus = "active" | "expired" | "cancelled";

type SubscriptionState = {
  currentPlan: Plan | null;
  status: SubscriptionStatus;
  nextBilling: string | null;
  billingCycle: "monthly" | "annual";
  transactions: Transaction[];
  paymentMethods: {
    id: string;
    type: "card" | "paypal";
    details: string;
    isDefault: boolean;
  }[];
};

type SubscriptionContextType = {
  subscription: SubscriptionState;
  isLoading: boolean;
  error: string | null;
  subscribeToPlan: (
    plan: Plan,
    billingCycle: "monthly" | "annual"
  ) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  changePlan: (newPlan: Plan) => Promise<void>;
  addPaymentMethod: (method: {
    type: "card" | "paypal";
    details: string;
  }) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  getTransactionHistory: () => Promise<Transaction[]>;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// Version control for state schema
const CURRENT_VERSION = 1;
const STORAGE_KEY = "@subscription_state_v";

type VersionedState = {
  version: number;
  data: SubscriptionState;
};

// Migration functions for each version upgrade
const migrations: Record<number, (state: any) => SubscriptionState> = {
  // Migration from version 0 to 1
  0: (oldState: any): SubscriptionState => ({
    currentPlan: null,
    status: "expired",
    nextBilling: null,
    billingCycle: "monthly",
    transactions: [],
    paymentMethods: [],
    ...oldState, // Preserve any existing data
  }),

  // Example migration from version 1 to 2
  // 1: (oldState: SubscriptionState): SubscriptionStateV2 => ({
  //   ...oldState,
  //   newField: defaultValue,
  //   modifiedField: transformOldField(oldState.someField),
  // }),
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

type StorageError = {
  message: string;
  operation: "load" | "save";
  retryCount: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    currentPlan: null,
    status: "expired",
    nextBilling: null,
    billingCycle: "monthly",
    transactions: [],
    paymentMethods: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StorageError | null>(null);

  // Load saved state on mount
  useEffect(() => {
    loadSubscriptionState();
  }, []);

  // Retry failed operations
  useEffect(() => {
    if (error && error.retryCount < MAX_RETRIES) {
      const retryOperation = async () => {
        await delay(RETRY_DELAY * (error.retryCount + 1));
        if (error.operation === "load") {
          loadSubscriptionState(error.retryCount + 1);
        } else {
          saveSubscriptionState(subscription, error.retryCount + 1);
        }
      };
      retryOperation();
    }
  }, [error]);

  const migrateState = (savedState: any): SubscriptionState => {
    let state = savedState;
    let version = (savedState as VersionedState)?.version ?? 0;

    while (version < CURRENT_VERSION) {
      if (!migrations[version]) {
        throw new Error(`Missing migration for version ${version}`);
      }
      try {
        console.log(
          `Migrating subscription state from version ${version} to ${
            version + 1
          }`
        );
        state = migrations[version](state.data || state);
        version++;
      } catch (error) {
        console.error(`Migration failed at version ${version}:`, error);
        throw error;
      }
    }

    return state as SubscriptionState;
  };

  const loadSubscriptionState = async (retryCount = 0) => {
    try {
      let savedState = await AsyncStorage.getItem(
        `${STORAGE_KEY}${CURRENT_VERSION}`
      );

      if (!savedState) {
        for (let version = CURRENT_VERSION - 1; version >= 0; version--) {
          const oldState = await AsyncStorage.getItem(
            `${STORAGE_KEY}${version}`
          );
          if (oldState) {
            savedState = oldState;
            break;
          }
        }
      }

      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          let validState: SubscriptionState;

          if ((parsedState as VersionedState).version !== CURRENT_VERSION) {
            validState = migrateState(parsedState);
            await saveSubscriptionState({
              version: CURRENT_VERSION,
              data: validState,
            });
          } else {
            validState = (parsedState as VersionedState).data;
          }

          if (!isValidSubscriptionState(validState)) {
            throw new Error("Invalid subscription state structure");
          }

          setSubscription(validState);
        } catch (parseError) {
          throw new Error(`Failed to parse subscription state: ${parseError}`);
        }
      }
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `Failed to load subscription state (attempt ${retryCount + 1}):`,
        errorMessage
      );

      setError({
        message: errorMessage,
        operation: "load",
        retryCount,
      });

      // If we've exhausted retries, try to recover with default state
      if (retryCount >= MAX_RETRIES) {
        console.warn("Max retries reached, using default state");
        setSubscription({
          currentPlan: null,
          status: "expired",
          nextBilling: null,
          billingCycle: "monthly",
          transactions: [],
          paymentMethods: [],
        });
      }
    } finally {
      if (retryCount >= MAX_RETRIES || !error) {
        setIsLoading(false);
      }
    }
  };

  const saveSubscriptionState = async (
    newState: SubscriptionState | VersionedState,
    retryCount = 0
  ) => {
    try {
      const stateToSave: VersionedState = {
        version: CURRENT_VERSION,
        data: "data" in newState ? newState.data : newState,
      };

      // Validate state before saving
      if (!isValidSubscriptionState(stateToSave.data)) {
        throw new Error("Invalid subscription state structure");
      }

      await AsyncStorage.setItem(
        `${STORAGE_KEY}${CURRENT_VERSION}`,
        JSON.stringify(stateToSave)
      );

      // Clean up old versions
      for (let version = CURRENT_VERSION - 1; version >= 0; version--) {
        await AsyncStorage.removeItem(`${STORAGE_KEY}${version}`);
      }

      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `Failed to save subscription state (attempt ${retryCount + 1}):`,
        errorMessage
      );

      setError({
        message: errorMessage,
        operation: "save",
        retryCount,
      });

      // If we've exhausted retries, notify the user
      if (retryCount >= MAX_RETRIES) {
        console.error("Failed to save subscription state after max retries");
        throw new Error(
          "Failed to save subscription state. Please try again later."
        );
      }
    }
  };

  const isValidSubscriptionState = (state: any): state is SubscriptionState => {
    return (
      state &&
      typeof state === "object" &&
      (state.currentPlan === null ||
        (typeof state.currentPlan === "object" &&
          typeof state.currentPlan.id === "string" &&
          typeof state.currentPlan.name === "string" &&
          typeof state.currentPlan.price === "object")) &&
      ["active", "expired", "cancelled"].includes(state.status) &&
      (state.nextBilling === null || typeof state.nextBilling === "string") &&
      ["monthly", "annual"].includes(state.billingCycle) &&
      Array.isArray(state.transactions) &&
      Array.isArray(state.paymentMethods)
    );
  };

  const subscribeToPlan = async (
    plan: Plan,
    billingCycle: "monthly" | "annual"
  ) => {
    try {
      const newState: SubscriptionState = {
        ...subscription,
        currentPlan: plan,
        status: "active",
        billingCycle,
        nextBilling: new Date(
          Date.now() +
            (billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      await saveSubscriptionState(newState);
      setSubscription(newState);
    } catch (error) {
      console.error("Failed to subscribe to plan:", error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      // TODO: Implement cancellation API call
      const newState: SubscriptionState = {
        ...subscription,
        status: "cancelled",
      };

      await saveSubscriptionState(newState);
      setSubscription(newState);
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      throw error;
    }
  };

  const changePlan = async (newPlan: Plan) => {
    try {
      // TODO: Implement plan change API call
      const newState: SubscriptionState = {
        ...subscription,
        currentPlan: newPlan,
        nextBilling: new Date(
          Date.now() +
            (subscription.billingCycle === "monthly" ? 30 : 365) *
              24 *
              60 *
              60 *
              1000
        ).toISOString(),
      };

      await saveSubscriptionState(newState);
      setSubscription(newState);
    } catch (error) {
      console.error("Failed to change plan:", error);
      throw error;
    }
  };

  const addPaymentMethod = async (method: {
    type: "card" | "paypal";
    details: string;
  }) => {
    try {
      // TODO: Implement payment method API call
      const newMethod = {
        id: Math.random().toString(36).substr(2, 9),
        ...method,
        isDefault: subscription.paymentMethods.length === 0,
      };

      const newState: SubscriptionState = {
        ...subscription,
        paymentMethods: [...subscription.paymentMethods, newMethod],
      };

      await saveSubscriptionState(newState);
      setSubscription(newState);
    } catch (error) {
      console.error("Failed to add payment method:", error);
      throw error;
    }
  };

  const removePaymentMethod = async (id: string) => {
    try {
      // TODO: Implement payment method removal API call
      const newState: SubscriptionState = {
        ...subscription,
        paymentMethods: subscription.paymentMethods.filter((m) => m.id !== id),
      };

      await saveSubscriptionState(newState);
      setSubscription(newState);
    } catch (error) {
      console.error("Failed to remove payment method:", error);
      throw error;
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    try {
      // TODO: Implement default payment method API call
      const newState: SubscriptionState = {
        ...subscription,
        paymentMethods: subscription.paymentMethods.map((m) => ({
          ...m,
          isDefault: m.id === id,
        })),
      };

      await saveSubscriptionState(newState);
      setSubscription(newState);
    } catch (error) {
      console.error("Failed to set default payment method:", error);
      throw error;
    }
  };

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    error: error?.message,
    subscribeToPlan,
    cancelSubscription,
    changePlan,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    getTransactionHistory: async () => subscription.transactions,
  };

  if (isLoading) {
    return null; // Or return a loading spinner
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}
