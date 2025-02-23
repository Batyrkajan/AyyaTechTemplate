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
import { theme } from "./theme";
import type { PropsWithChildren, ComponentType, ReactNode } from "react";
import { SettingsProvider } from "./contexts/SettingsContext";

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
    component: HomeScreen,
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
];

function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={screenOptions}>
      {screens.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
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
        <Navigation />
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
