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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import * as AsyncStorage from "@react-native-async-storage/async-storage";

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

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!validateForm()) {
      shakeForm();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    startLoadingAnimation();

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccessAnimation();

      setTimeout(() => {
        navigation.replace("Dashboard");
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      shakeForm();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to login. Please try again.");
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
      setIsLoading(true);
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
      setIsLoading(false);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Add Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.header,
            {
              opacity: animationValues.fadeAnim,
              transform: [{ translateY: animationValues.slideAnim }],
            },
          ]}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.form,
            {
              opacity: animationValues.formOpacity,
              transform: [
                { translateY: animationValues.formSlide },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.inputContainer,
              {
                transform: [
                  {
                    scale: emailFocus.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.colors.text + "80"}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.text + "60"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.inputContainer,
              {
                transform: [
                  {
                    scale: passwordFocus.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={theme.colors.text + "80"}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.colors.text + "60"}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              onFocus={() => {
                handleFocus("password");
                setShowPasswordRequirements(true);
              }}
              onBlur={() => handleBlur("password")}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showPasswordButton}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.colors.text + "80"}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Add validation error messages */}
          {Object.entries(validationErrors).map(([field, message]) => (
            <Animated.Text
              key={field}
              style={[
                styles.errorText,
                {
                  opacity: errorAnims[field as keyof typeof errorAnims],
                  transform: [
                    {
                      translateX: errorAnims[
                        field as keyof typeof errorAnims
                      ].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {message}
            </Animated.Text>
          ))}

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.buttonContent,
                {
                  transform: [{ scale: buttonScale }],
                },
              ]}
            >
              {isLoading ? (
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: loadingRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons
                    name="reload-outline"
                    size={24}
                    color={theme.colors.background}
                  />
                </Animated.View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </Animated.View>
          </TouchableOpacity>

          {renderPasswordStrength()}
        </Animated.View>

        {/* Social Login Section - Moved after form */}
        {renderSocialButtons()}

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Biometric Button */}
        {renderBiometricButton()}

        {/* Success Animation Overlay */}
        {isLoading && (
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successScale,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.successIcon,
                {
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={theme.colors.primary}
              />
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: "center",
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
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  showPasswordButton: {
    padding: 8,
  },
  forgotPassword: {
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
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  signupText: {
    color: theme.colors.text + "80",
    fontSize: 14,
  },
  signupLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background + "F0",
    justifyContent: "center",
    alignItems: "center",
  },
  successIcon: {
    backgroundColor: theme.colors.background,
    borderRadius: 40,
    padding: 8,
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
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 16,
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
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary + "40",
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 24,
  },
});
