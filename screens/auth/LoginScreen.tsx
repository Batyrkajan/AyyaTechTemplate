import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Dimensions,
  Easing,
  Vibration,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import * as AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = ScreenProps<"Login">;

// Add social login types
type SocialProvider = "google" | "apple" | "facebook" | "twitter";

type BiometricType = "fingerprint" | "facial" | "iris";

// Add validation rules
const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
    minLength: 5,
    maxLength: 50,
    blockedDomains: ["tempmail.com", "disposable.com"],
  },
  password: {
    minLength: 8,
    maxLength: 50,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    requirements: {
      lowercase: /[a-z]/,
      uppercase: /[A-Z]/,
      number: /[0-9]/,
      special: /[@$!%*?&]/,
      noSpaces: /^\S*$/,
      noConsecutive: /(.)\1{2,}/,
    },
    message: "Password must meet all requirements",
  },
};

type PasswordStrength = {
  score: number;
  label: string;
  color: string;
};

// Add social providers configuration
const socialProviders: {
  id: SocialProvider;
  icon: React.ReactNode;
  label: string;
  available: boolean;
  backgroundColor?: string;
  textColor?: string;
}[] = [
  {
    id: "google",
    icon: <Ionicons name="logo-google" size={24} color="#DB4437" />,
    label: "Continue with Google",
    available: true,
    backgroundColor: "#ffffff",
    textColor: "#000000",
  },
  {
    id: "apple",
    icon: <Ionicons name="logo-apple" size={24} color="#000000" />,
    label: "Continue with Apple",
    available: Platform.OS === "ios",
    backgroundColor: "#000000",
    textColor: "#ffffff",
  },
  {
    id: "facebook",
    icon: <Ionicons name="logo-facebook" size={24} color="#4267B2" />,
    label: "Continue with Facebook",
    available: true,
    backgroundColor: "#4267B2",
    textColor: "#ffffff",
  },
  {
    id: "twitter",
    icon: <Ionicons name="logo-twitter" size={24} color="#ffffff" />,
    label: "Continue with Twitter",
    available: true,
    backgroundColor: "#1DA1F2",
    textColor: "#ffffff",
  },
];

// Add validation rules at the top after imports
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(100)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  // Field focus animations
  const emailFocus = useRef(new Animated.Value(0)).current;
  const passwordFocus = useRef(new Animated.Value(0)).current;

  // Add new state
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "Very Weak",
    color: theme.colors.accent,
  });
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Add new animation values
  const [animationValues, setAnimationValues] = useState({
    fadeAnim: new Animated.Value(0),
    slideAnim: new Animated.Value(50),
    socialButtonsAnim: new Animated.Value(0),
    socialButtonsSlide: new Animated.Value(50),
    formOpacity: new Animated.Value(0),
    formSlide: new Animated.Value(100),
  });

  const errorAnims = {
    email: useRef(new Animated.Value(0)).current,
    password: useRef(new Animated.Value(0)).current,
  };

  const { signIn } = useAuth();

  // Add error state
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check biometric support
    checkBiometricSupport();

    // Initial animations
    const {
      fadeAnim,
      slideAnim,
      socialButtonsAnim,
      socialButtonsSlide,
      formOpacity,
      formSlide,
    } = animationValues;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(formOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(formSlide, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(socialButtonsAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(socialButtonsSlide, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (compatible && enrolled) {
        setBiometricEnabled(true);

        // Set specific biometric type
        if (
          types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        ) {
          setBiometricType("facial");
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ) {
          setBiometricType("fingerprint");
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.IRIS)
        ) {
          setBiometricType("iris");
        }
      }
    } catch (error) {
      console.error("Error checking biometric support:", error);
      setBiometricEnabled(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      // First check if biometric is available and enrolled
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert(
          "Error",
          "Biometric authentication is not available on this device"
        );
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert(
          "Error",
          "No biometric auth methods have been set up on this device"
        );
        return;
      }

      // Attempt authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Log in with biometrics",
        fallbackLabel: "Use passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false, // Allow fallback to device passcode
        requireConfirmation: false, // Don't require explicit confirmation after biometric
      });

      if (result.success) {
        // Successful biometric authentication
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        showSuccessAnimation();
        // Handle successful login
        navigation.replace("Dashboard");
      } else if (result.error === "user_cancel") {
        // User canceled authentication
        return;
      } else if (result.error === "lockout") {
        Alert.alert(
          "Locked Out",
          "Too many failed attempts. Please use your passcode to unlock."
        );
      } else if (result.error === "lockout_permanent") {
        Alert.alert(
          "Permanently Locked Out",
          "Biometric authentication has been disabled. Please use your passcode."
        );
      } else if (result.error === "user_fallback") {
        // User chose to use passcode instead
        Alert.alert(
          "Passcode Required",
          "Please enter your passcode to continue",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Continue",
              onPress: () => handlePasscodeAuth(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Authentication Failed",
          "Please try again or use your passcode"
        );
      }
    } catch (error) {
      console.error("Biometric auth error:", error);
      Alert.alert(
        "Error",
        "Something went wrong with biometric authentication"
      );
    }
  };

  const handlePasscodeAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Enter Passcode",
        fallbackLabel: "Enter Passcode",
        disableDeviceFallback: false,
      });

      if (result.success) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        showSuccessAnimation();
        navigation.replace("Dashboard");
      }
    } catch (error) {
      console.error("Passcode auth error:", error);
      Alert.alert("Error", "Failed to authenticate with passcode");
    }
  };

  const validateInputs = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes("Invalid login credentials")) {
          Alert.alert("Login Failed", "Invalid email or password");
        } else if (error.message.includes("Email not confirmed")) {
          Alert.alert(
            "Email Not Verified",
            "Please check your email and verify your account before logging in."
          );
        } else {
          throw error;
        }
        return;
      }

      // On successful login, navigation will be handled by the auth state change in AuthContext
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        "There was a problem signing in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const shakeForm = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startLoadingAnimation = () => {
    Animated.loop(
      Animated.timing(loadingRotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const showSuccessAnimation = () => {
    Animated.spring(successScale, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleFocus = (field: "email" | "password") => {
    const anim = field === "email" ? emailFocus : passwordFocus;
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = (field: "email" | "password") => {
    const anim = field === "email" ? emailFocus : passwordFocus;
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    // Email validation
    if (!email) {
      errors.email = "Email is required";
    } else if (!validationRules.email.pattern.test(email)) {
      errors.email = validationRules.email.message;
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < validationRules.password.minLength) {
      errors.password = `Password must be at least ${validationRules.password.minLength} characters`;
    } else if (!validationRules.password.pattern.test(password)) {
      errors.password = validationRules.password.message;
    }

    setValidationErrors(errors);

    // Animate error messages
    Object.keys(errors).forEach((field) => {
      Animated.sequence([
        Animated.timing(errorAnims[field as keyof typeof errorAnims], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(errorAnims[field as keyof typeof errorAnims], {
          toValue: 0,
          duration: 300,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return Object.keys(errors).length === 0;
  };

  // Add social login handler
  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // TODO: Implement actual social auth
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace("Dashboard");
    } catch (error) {
      console.error(`${provider} login error:`, error);
      Alert.alert(
        "Authentication Error",
        `Failed to login with ${provider}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case "fingerprint":
        return "finger-print-outline";
      case "facial":
        return "scan-outline";
      case "iris":
        return "eye-outline";
      default:
        return "key-outline";
    }
  };

  const getBiometricLabel = () => {
    switch (biometricType) {
      case "fingerprint":
        return "Use Fingerprint";
      case "facial":
        return "Use Face ID";
      case "iris":
        return "Use Iris Scan";
      default:
        return "Use Biometrics";
    }
  };

  // Update social buttons section in JSX
  const renderSocialButtons = () => (
    <Animated.View
      style={[
        styles.socialSection,
        {
          opacity: animationValues.socialButtonsAnim,
          transform: [{ translateY: animationValues.socialButtonsSlide }],
        },
      ]}
    >
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        {socialProviders
          .filter((provider) => provider.available)
          .map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={[
                styles.socialButton,
                {
                  backgroundColor:
                    provider.backgroundColor || theme.colors.secondary,
                },
              ]}
              onPress={() => handleSocialButtonPress(provider.id)}
              activeOpacity={0.8}
            >
              {provider.icon}
              <Text
                style={[
                  styles.socialButtonText,
                  {
                    color: provider.textColor || theme.colors.text,
                  },
                ]}
              >
                {provider.label}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </Animated.View>
  );

  // Add biometric login button component
  const renderBiometricButton = () => {
    if (!biometricType) return null;

    return (
      <Animated.View
        style={[
          styles.biometricButton,
          {
            opacity: animationValues.socialButtonsAnim,
            transform: [
              {
                scale: animationValues.socialButtonsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleBiometricAuth}
          style={styles.biometricTouchable}
        >
          <Ionicons
            name={getBiometricIcon()}
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.biometricText}>{getBiometricLabel()}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Add password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const rules = validationRules.password.requirements;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (rules.lowercase.test(password)) score++;
    if (rules.uppercase.test(password)) score++;
    if (rules.number.test(password)) score++;
    if (rules.special.test(password)) score++;
    if (!rules.noConsecutive.test(password)) score++;

    const strengths: PasswordStrength[] = [
      { score: 0, label: "Very Weak", color: theme.colors.accent },
      { score: 2, label: "Weak", color: "#ff4444" },
      { score: 4, label: "Fair", color: "#ffbb33" },
      { score: 6, label: "Good", color: "#00C851" },
      { score: 7, label: "Strong", color: "#007E33" },
    ];

    return strengths.reduce((prev, curr) =>
      score >= curr.score ? curr : prev
    );
  };

  // Add password validation component
  const renderPasswordStrength = () => {
    if (!password || !showPasswordRequirements) return null;

    const requirements = [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Lowercase letter", met: /[a-z]/.test(password) },
      { label: "Uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Number", met: /[0-9]/.test(password) },
      { label: "Special character", met: /[@$!%*?&]/.test(password) },
      {
        label: "No consecutive repeating characters",
        met: !/(.)\\1{2,}/.test(password),
      },
    ];

    return (
      <Animated.View
        style={[
          styles.passwordRequirements,
          {
            opacity: animationValues.formOpacity,
            transform: [{ translateY: animationValues.formSlide }],
          },
        ]}
      >
        <View style={styles.strengthIndicator}>
          <View
            style={[
              styles.strengthBar,
              {
                width: `${(passwordStrength.score / 7) * 100}%`,
                backgroundColor: passwordStrength.color,
              },
            ]}
          />
          <Text
            style={[styles.strengthLabel, { color: passwordStrength.color }]}
          >
            {passwordStrength.label}
          </Text>
        </View>
        {requirements.map((req, index) => (
          <View key={index} style={styles.requirementRow}>
            <Ionicons
              name={req.met ? "checkmark-circle" : "close-circle"}
              size={16}
              color={req.met ? theme.colors.primary : theme.colors.accent}
            />
            <Text
              style={[
                styles.requirementText,
                { color: req.met ? theme.colors.text : theme.colors.accent },
              ]}
            >
              {req.label}
            </Text>
          </View>
        ))}
      </Animated.View>
    );
  };

  // Update password change handler
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(calculatePasswordStrength(text));
  };

  // Add social button press animation
  const handleSocialButtonPress = async (provider: SocialProvider) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    await handleSocialLogin(provider);
  };

  const renderError = (error: string) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <View
            style={[styles.inputContainer, errors.email && styles.inputError]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.colors.text}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.text + "80"}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="off"
              textContentType="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
          </View>
          {renderError(errors.email)}

          <View
            style={[
              styles.inputContainer,
              errors.password && styles.inputError,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={theme.colors.text}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.colors.text + "80"}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              autoComplete="off"
              textContentType="none"
              passwordRules="none"
              spellCheck={false}
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
          {renderError(errors.password)}

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signUpButton}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text + "80",
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: theme.colors.text,
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 8,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    paddingVertical: 20,
  },
  footerText: {
    color: theme.colors.text + "80",
    marginRight: 4,
  },
  signUpButton: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  socialSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.text + "20",
  },
  dividerText: {
    color: theme.colors.text + "60",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  errorText: {
    color: theme.colors.accent,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 16,
  },
  inputError: {
    borderColor: theme.colors.accent,
  },
  biometricButton: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  biometricTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + "20",
  },
  biometricText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  passwordRequirements: {
    marginTop: 8,
    padding: 12,
    backgroundColor: theme.colors.secondary + "20",
    borderRadius: 8,
  },
  strengthIndicator: {
    marginBottom: 12,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.secondary,
  },
  strengthLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 12,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    width: "100%",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
});
