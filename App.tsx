import {
  NavigationContainer,
  DarkTheme,
  Theme,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import SignUpScreen from "./screens/auth/SignUpScreen";
import DashboardScreen from "./screens/dashboard/DashboardScreen";
import ForgotPasswordScreen from "./screens/auth/ForgotPasswordScreen";
import ProfileScreen from "./screens/profile/ProfileScreen";
import EditProfileScreen from "./screens/profile/EditProfileScreen";
import SettingsScreen from "./screens/profile/SettingsScreen";
import GeneralSettingsScreen from "./screens/settings/GeneralSettingsScreen";
import PrivacySettingsScreen from "./screens/settings/PrivacySettingsScreen";
import NotificationSettingsScreen from "./screens/settings/NotificationSettingsScreen";
import SecuritySettingsScreen from "./screens/settings/SecuritySettingsScreen";
import DataManagementScreen from "./screens/settings/DataManagementScreen";
import SubscriptionPlansScreen from "./screens/subscription/SubscriptionPlansScreen";
import PaymentProcessScreen from "./screens/subscription/PaymentProcessScreen";
import PaymentConfirmationScreen from "./screens/subscription/PaymentConfirmationScreen";
import TransactionHistoryScreen from "./screens/subscription/TransactionHistoryScreen";
import ManageSubscriptionScreen from "./screens/subscription/ManageSubscriptionScreen";
import WelcomeScreen from "./screens/auth/WelcomeScreen";
import UsageStatsScreen from "./screens/dashboard/UsageStatsScreen";
import ActivityHistoryScreen from "./screens/dashboard/ActivityHistoryScreen";
import PaymentMethodsScreen from "./screens/dashboard/PaymentMethodsScreen";
import { theme } from "./theme";
import type { PropsWithChildren, ComponentType, ReactNode } from "react";
import { SettingsProvider } from "./contexts/SettingsContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  GeneralSettings: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  SecuritySettings: undefined;
  DataManagement: undefined;
  SubscriptionPlans: undefined;
  PaymentProcess: {
    plan: {
      id: string;
      name: string;
      price: {
        monthly: number;
        annual: number;
      };
    };
  };
  PaymentConfirmation: undefined;
  TransactionHistory: undefined;
  ManageSubscription: undefined;
  UsageStats: undefined;
  ActivityHistory: undefined;
  PaymentMethods: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.secondary,
    text: theme.colors.text,
    border: theme.colors.secondary,
    notification: theme.colors.accent,
  },
};

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: {
    backgroundColor: theme.colors.background,
  },
  animation: "fade",
};

type Screen = {
  name: keyof RootStackParamList;
  component: ComponentType<any>;
  options?: NativeStackNavigationOptions;
};

const screens: Screen[] = [
  {
    name: "Splash",
    component: SplashScreen,
    options: {
      gestureEnabled: false,
      animation: "none",
    },
  },
  {
    name: "Welcome",
    component: WelcomeScreen,
  },
  {
    name: "Login",
    component: LoginScreen,
  },
  {
    name: "SignUp",
    component: SignUpScreen,
  },
  {
    name: "ForgotPassword",
    component: ForgotPasswordScreen,
  },
  {
    name: "Dashboard",
    component: DashboardScreen,
  },
  {
    name: "Profile",
    component: ProfileScreen,
  },
  {
    name: "EditProfile",
    component: EditProfileScreen,
  },
  {
    name: "Settings",
    component: SettingsScreen,
  },
  {
    name: "GeneralSettings",
    component: GeneralSettingsScreen,
  },
  {
    name: "PrivacySettings",
    component: PrivacySettingsScreen,
  },
  {
    name: "NotificationSettings",
    component: NotificationSettingsScreen,
  },
  {
    name: "SecuritySettings",
    component: SecuritySettingsScreen,
  },
  {
    name: "DataManagement",
    component: DataManagementScreen,
  },
  {
    name: "SubscriptionPlans",
    component: SubscriptionPlansScreen,
  },
  {
    name: "PaymentProcess",
    component: PaymentProcessScreen,
  },
  {
    name: "PaymentConfirmation",
    component: PaymentConfirmationScreen,
  },
  {
    name: "TransactionHistory",
    component: TransactionHistoryScreen,
  },
  {
    name: "ManageSubscription",
    component: ManageSubscriptionScreen,
  },
  {
    name: "UsageStats",
    component: UsageStatsScreen,
  },
  {
    name: "ActivityHistory",
    component: ActivityHistoryScreen,
  },
  {
    name: "PaymentMethods",
    component: PaymentMethodsScreen,
  },
];

function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={screenOptions}>
      {screens.map((screen) => (
        <Stack.Screen
          name={screen.name}
          component={screen.component}
          options={screen.options}
          key={screen.name}
        />
      ))}
    </Stack.Navigator>
  );
}

type NavigationProviderProps = {
  children: ReactNode;
};

function NavigationProvider({ children }: NavigationProviderProps) {
  return (
    <NavigationContainer theme={navigationTheme}>
      {children}
    </NavigationContainer>
  );
}

function Navigation() {
  return (
    <NavigationProvider>
      <RootStack />
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SettingsProvider>
        <SubscriptionProvider>
          <Navigation />
        </SubscriptionProvider>
      </SettingsProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
