import {
  NavigationContainer,
  DarkTheme,
  Theme,
  DefaultTheme,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import SignUpScreen from "./screens/auth/SignUpScreen";
import DashboardScreen from "./screens/dashboard/DashboardScreen";
import ForgotPasswordScreen from "./screens/auth/ForgotPasswordScreen";
import { theme } from "./theme";
import type { ReactNode } from "react";

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
};

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
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
};

const screens: Screen[] = [
  {
    name: "Splash",
    component: SplashScreen,
    options: {
      gestureEnabled: false,
      animationTypeForReplace: "pop" as const,
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
];

function RootStack(): ReactNode {
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

function Navigation(): ReactNode {
  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack />
    </NavigationContainer>
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
