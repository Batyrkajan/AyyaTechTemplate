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
import { theme } from "./theme";
import type { PropsWithChildren, ComponentType } from "react";

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
      animationTypeForReplace: "pop",
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
];

function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={screenOptions}
    >
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

type NavigationProviderProps = PropsWithChildren;

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
      <Navigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
