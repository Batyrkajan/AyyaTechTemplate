import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Animated,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Clipboard,
  Image,
} from "react-native";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import { AnimatedInput } from "../../components/AnimatedInput";
import { GoogleIcon, AppleIcon } from "../../assets/icons";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { calculatePasswordStrength } from "../../utils/passwordUtils";
import * as LocalAuthentication from "expo-local-authentication";
import PhoneInput from "react-native-phone-number-input";
import {
  VerificationMethod,
  VerificationState,
  SecurityQuestion,
  generateRecoveryCodes,
  saveVerificationState,
} from "../../utils/verificationUtils";

type Props = ScreenProps<"SignUp">;

// Add social auth types
type SocialProvider = "google" | "apple" | "facebook" | "twitter";

// Add more validation rules
const validationRules = {
  fullName: {
    pattern: /^[a-zA-Z]+(?: [a-zA-Z]+)*$/,
    minLength: 2,
    maxLength: 50,
    message: "Please enter your full name (letters and spaces only)",
    bannedWords: ["admin", "root", "system"],
    required: true,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minLength: 5,
    maxLength: 50,
    blockedDomains: ["tempmail.com", "disposable.com"],
    message: "Please enter a valid email address",
    required: true,
    uniqueCheck: true,
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
      noCommonWords: /(password|123456|qwerty)/i,
      minEntropy: 50,
    },
    required: true,
  },
};

// Add types
type PasswordStrength = {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
};

// Add verification types and state
type VerificationState = {
  attempts: number;
  maxAttempts: number;
  lastResendTime: number;
  resendCooldown: number;
};

// Add types
type VerificationType = "email" | "phone" | "biometric";

export default function SignUpScreen({ navigation }: Props) {
  // Add state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "Very Weak",
    color: theme.colors.accent,
    suggestions: [],
  });
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
  const [verificationStep, setVerificationStep] = useState<
    "form" | "verification"
  >("form");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationState, setVerificationState] = useState<VerificationState>(
    {
      attempts: 0,
      maxAttempts: 3,
      lastResendTime: 0,
      resendCooldown: 30, // seconds
    }
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneRef, setPhoneRef] = useState<PhoneInput | null>(null);
  const [verificationType, setVerificationType] =
    useState<VerificationType>("email");
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] =
    useState<LocalAuthentication.AuthenticationType | null>(null);
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>("email");
  const [backupEmail, setBackupEmail] = useState("");
  const [authenticatorKey, setAuthenticatorKey] = useState("");
  const [securityQuestions, setSecurityQuestions] = useState<
    SecurityQuestion[]
  >([]);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // Add animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(100)).current;
  const socialButtonsAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(socialButtonsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Add validation function
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Validate full name
    if (!formData.fullName) {
      errors.fullName = "Full name is required";
    } else if (!validationRules.fullName.pattern.test(formData.fullName)) {
      errors.fullName = validationRules.fullName.message;
    }

    // Validate email
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validationRules.email.pattern.test(formData.email)) {
      errors.email = validationRules.email.message;
    } else if (
      validationRules.email.blockedDomains.some((domain) =>
        formData.email.toLowerCase().endsWith(`@${domain}`)
      )
    ) {
      errors.email = "Please use a valid email domain";
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      const reqs = validationRules.password.requirements;
      if (formData.password.length < validationRules.password.minLength) {
        errors.password = `Password must be at least ${validationRules.password.minLength} characters`;
      } else if (!reqs.lowercase.test(formData.password)) {
        errors.password = "Password must contain a lowercase letter";
      } else if (!reqs.uppercase.test(formData.password)) {
        errors.password = "Password must contain an uppercase letter";
      } else if (!reqs.number.test(formData.password)) {
        errors.password = "Password must contain a number";
      } else if (!reqs.special.test(formData.password)) {
        errors.password = "Password must contain a special character";
      } else if (!reqs.noSpaces.test(formData.password)) {
        errors.password = "Password cannot contain spaces";
      } else if (reqs.noConsecutive.test(formData.password)) {
        errors.password = "Password cannot contain repeated characters";
      }
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add social providers
  const socialProviders: {
    id: SocialProvider;
    icon: React.ReactNode;
    label: string;
    available: boolean;
  }[] = [
    {
      id: "google",
      icon: <GoogleIcon width={24} height={24} />,
      label: "Google",
      available: true,
    },
    {
      id: "apple",
      icon: <AppleIcon width={24} height={24} />,
      label: "Apple",
      available: Platform.OS === "ios",
    },
    {
      id: "facebook",
      icon: <Ionicons name="logo-facebook" size={24} color="#1877F2" />,
      label: "Facebook",
      available: true,
    },
    {
      id: "twitter",
      icon: <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />,
      label: "Twitter",
      available: true,
    },
  ];

  // Add password strength indicator component
  const renderPasswordStrength = () => {
    if (!formData.password) return null;

    return (
      <Animated.View style={styles.strengthContainer}>
        <View style={styles.strengthBar}>
          <Animated.View
            style={[
              styles.strengthFill,
              {
                width: `${(passwordStrength.score / 4) * 100}%`,
                backgroundColor: passwordStrength.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
          {passwordStrength.label}
        </Text>
        {passwordStrength.suggestions.length > 0 && (
          <View style={styles.suggestionsList}>
            {passwordStrength.suggestions.map((suggestion, index) => (
              <Text key={index} style={styles.suggestionText}>
                • {suggestion}
              </Text>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  // Update password change handler
  const handlePasswordChange = (text: string) => {
    setFormData({ ...formData, password: text });
    setPasswordStrength(calculatePasswordStrength(text));
  };

  // Add email verification handler
  const handleEmailVerification = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement actual email verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsEmailVerificationSent(true);
      Alert.alert(
        "Verification Email Sent",
        "Please check your email to verify your account.",
        [
          {
            text: "OK",
            onPress: () => navigation.replace("Login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send verification email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Update sign up handler
  const handleSignUp = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (passwordStrength.score < 2) {
      Alert.alert(
        "Weak Password",
        "Please choose a stronger password to continue.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual signup logic
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await handleEmailVerification();
    } catch (error) {
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add social sign-up handler
  const handleSocialSignUp = async (provider: SocialProvider) => {
    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // TODO: Implement actual social auth
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace("Dashboard");
    } catch (error) {
      console.error(`${provider} sign up error:`, error);
      Alert.alert(
        "Authentication Error",
        `Failed to sign up with ${provider}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Add verification code validation
  const validateVerificationCode = (code: string): boolean => {
    // Add your validation rules here
    const isValid = /^\d{6}$/.test(code);
    const isNotSequential =
      !/^(.)\1{5}$/.test(code) && !/^(012345|123456|987654)$/.test(code);
    const isNotRepeating = !/(.)\1{2,}/.test(code);

    return isValid && isNotSequential && isNotRepeating;
  };

  // Add verification handler
  const handleVerifyCode = async () => {
    if (!validateVerificationCode(verificationCode)) {
      Alert.alert("Invalid Code", "Please enter a valid 6-digit code");
      return;
    }

    if (verificationState.attempts >= verificationState.maxAttempts) {
      Alert.alert(
        "Too Many Attempts",
        "Please request a new code and try again",
        [
          {
            text: "OK",
            onPress: () => handleResendCode(),
          },
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful verification
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace("Dashboard");
    } catch (error) {
      setVerificationState((prev) => ({
        ...prev,
        attempts: prev.attempts + 1,
      }));

      Alert.alert("Verification Failed", "Please check the code and try again");
    } finally {
      setIsLoading(false);
    }
  };

  // Add resend code functionality
  const handleResendCode = async () => {
    const now = Date.now();
    const timeSinceLastResend = Math.floor(
      (now - verificationState.lastResendTime) / 1000
    );

    if (timeSinceLastResend < verificationState.resendCooldown) {
      Alert.alert(
        "Please Wait",
        `You can request a new code in ${
          verificationState.resendCooldown - timeSinceLastResend
        } seconds`
      );
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual resend logic
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setVerificationState((prev) => ({
        ...prev,
        attempts: 0,
        lastResendTime: now,
      }));
      setVerificationCode("");

      // Start countdown timer
      setResendTimer(verificationState.resendCooldown);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Alert.alert("Success", "A new verification code has been sent");
    } catch (error) {
      Alert.alert("Error", "Failed to send new code. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  // Add cleanup
  useEffect(() => {
    return () => {
      // Clear any existing timers
      setResendTimer(0);
    };
  }, []);

  // Add verification code UI
  const renderVerificationUI = () => {
    return (
      <Animated.View
        style={[
          styles.verificationContainer,
          {
            opacity: formOpacity,
            transform: [{ translateY: formSlide }],
          },
        ]}
      >
        <Text style={styles.verificationTitle}>Verify Your Email</Text>
        <Text style={styles.verificationSubtitle}>
          We've sent a verification code to {formData.email}
        </Text>

        <View style={styles.codeInputContainer}>
          <AnimatedInput
            icon="key-outline"
            placeholder="Enter verification code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            !verificationCode && styles.buttonDisabled,
          ]}
          onPress={handleVerifyCode}
          disabled={!verificationCode || isLoading}
        >
          {isLoading ? (
            <LoadingIndicator size={24} color={theme.colors.background} />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            {resendTimer > 0
              ? `Resend code in ${resendTimer}s`
              : "Didn't receive the code?"}
          </Text>
          {resendTimer === 0 && (
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendButton}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  // Add biometric check
  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return;

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) return;

      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.length > 0) {
        setIsBiometricSupported(true);
        setBiometricType(types[0]);
      }
    } catch (error) {
      console.error("Biometric check error:", error);
    }
  };

  // Add biometric verification
  const handleBiometricVerification = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Verify your identity",
        fallbackLabel: "Use passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        setVerificationType("email");
      }
    } catch (error) {
      console.error("Biometric auth error:", error);
      Alert.alert("Error", "Biometric verification failed");
    }
  };

  // Add phone verification
  const handlePhoneVerification = async () => {
    if (!phoneRef?.isValidNumber(phoneNumber)) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual phone verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setVerificationType("phone");
      setVerificationStep("verification");
    } catch (error) {
      Alert.alert("Error", "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  // Add phone input component
  const renderPhoneInput = () => (
    <View style={styles.phoneInputContainer}>
      <PhoneInput
        ref={(ref) => setPhoneRef(ref)}
        value={phoneNumber}
        onChangeFormattedText={setPhoneNumber}
        defaultCode="TR"
        layout="first"
        withDarkTheme
        withShadow
        containerStyle={styles.phoneInput}
        textContainerStyle={styles.phoneInputText}
        textInputStyle={{ color: theme.colors.text }}
        codeTextStyle={{ color: theme.colors.text }}
      />
      {phoneNumber && !phoneRef?.isValidNumber(phoneNumber) && (
        <Text style={styles.errorText}>Please enter a valid phone number</Text>
      )}
    </View>
  );

  // Add verification options
  const renderVerificationOptions = () => (
    <View style={styles.verificationOptions}>
      <Text style={styles.verificationTitle}>Verify Your Identity</Text>

      {isBiometricSupported && (
        <TouchableOpacity
          style={styles.verificationOption}
          onPress={handleBiometricVerification}
        >
          <Ionicons
            name={
              biometricType ===
              LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
                ? "scan-outline"
                : "finger-print-outline"
            }
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.verificationOptionText}>
            Use{" "}
            {biometricType ===
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
              ? "Face ID"
              : "Fingerprint"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.verificationOption}
        onPress={handlePhoneVerification}
      >
        <Ionicons
          name="phone-portrait-outline"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={styles.verificationOptionText}>Verify with Phone</Text>
      </TouchableOpacity>
    </View>
  );

  // Add verification persistence
  const saveVerificationData = async () => {
    const verificationState: VerificationState = {
      primaryMethod: verificationMethod,
      backupMethods: ["email", "security_questions"],
      recoveryOptions: [
        { type: "backup_email", value: backupEmail },
        { type: "recovery_codes", value: recoveryCodes.join(",") },
        { type: "security_questions", value: "set" },
      ],
      securityQuestions,
      lastVerified: new Date().toISOString(),
      verificationExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    await saveVerificationState(verificationState);
  };

  // Add authenticator setup
  const setupAuthenticator = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement actual authenticator setup
      const key = generateAuthenticatorKey();
      setAuthenticatorKey(key);
      setVerificationMethod("authenticator");
    } catch (error) {
      Alert.alert("Error", "Failed to setup authenticator");
    } finally {
      setIsLoading(false);
    }
  };

  // Add recovery setup
  const setupRecoveryOptions = async () => {
    try {
      setIsLoading(true);
      const codes = generateRecoveryCodes();
      setRecoveryCodes(codes);
      await saveVerificationData();

      Alert.alert(
        "Recovery Codes",
        "Please save these recovery codes in a safe place. You will need them if you lose access to your account.",
        [
          {
            text: "Copy Codes",
            onPress: () => Clipboard.setString(codes.join("\n")),
          },
          { text: "OK" },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to generate recovery codes");
    } finally {
      setIsLoading(false);
    }
  };

  // Add security questions component
  const renderSecurityQuestions = () => (
    <View style={styles.securityQuestionsContainer}>
      <Text style={styles.sectionTitle}>Security Questions</Text>
      {availableQuestions.slice(0, 3).map((question, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question}</Text>
          <AnimatedInput
            icon="lock-closed-outline"
            placeholder="Your answer"
            value={securityQuestions[index]?.answer || ""}
            onChangeText={(text) => {
              const updatedQuestions = [...securityQuestions];
              updatedQuestions[index] = {
                id: String(index),
                question,
                answer: text,
              };
              setSecurityQuestions(updatedQuestions);
            }}
            secureTextEntry
          />
        </View>
      ))}
    </View>
  );

  // Add security questions
  const availableQuestions = [
    "What was your first pet's name?",
    "In what city were you born?",
    "What is your mother's maiden name?",
    "What high school did you attend?",
    "What was your childhood nickname?",
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
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
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start your journey</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.form,
            {
              opacity: formOpacity,
              transform: [{ translateY: formSlide }],
            },
          ]}
        >
          <AnimatedInput
            icon="person-outline"
            placeholder="Full Name"
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
            error={validationErrors.fullName}
            autoCapitalize="words"
          />

          <AnimatedInput
            icon="mail-outline"
            placeholder="Email Address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            error={validationErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AnimatedInput
            icon="lock-closed-outline"
            placeholder="Password"
            value={formData.password}
            onChangeText={handlePasswordChange}
            error={validationErrors.password}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            }
          />

          {renderPasswordStrength()}

          <AnimatedInput
            icon="lock-closed-outline"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, confirmPassword: text })
            }
            error={validationErrors.confirmPassword}
            secureTextEntry={!showConfirmPassword}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingIndicator size={24} color={theme.colors.background} />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.socialSection,
            {
              opacity: socialButtonsAnim,
              transform: [{ translateY: slideAnim }],
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
                  style={styles.socialButton}
                  onPress={() => handleSocialSignUp(provider.id)}
                >
                  {provider.icon}
                  <Text style={styles.socialButtonText}>{provider.label}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </Animated.View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{" "}
            <Text style={styles.loginLinkHighlight}>Log In</Text>
          </Text>
        </TouchableOpacity>

        {verificationStep === "verification" && renderVerificationUI()}

        {verificationType === "phone" && renderPhoneInput()}

        {verificationType === "verification" && renderVerificationOptions()}

        {verificationMethod === "security_questions" &&
          renderSecurityQuestions()}
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
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 24,
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
    gap: 20,
  },
  signUpButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  socialSection: {
    marginTop: 40,
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
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    padding: 12,
    borderRadius: 12,
    width: "100%",
  },
  socialButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    marginLeft: 12,
  },
  loginLink: {
    marginTop: 40,
    alignItems: "center",
  },
  loginLinkText: {
    color: theme.colors.text + "80",
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  strengthContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  strengthBar: {
    height: 4,
    backgroundColor: theme.colors.secondary + "40",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  suggestionsList: {
    marginTop: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: theme.colors.text + "80",
    marginBottom: 4,
  },
  verificationContainer: {
    padding: 20,
    alignItems: "center",
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 12,
  },
  verificationSubtitle: {
    fontSize: 16,
    color: theme.colors.text + "80",
    textAlign: "center",
    marginBottom: 32,
  },
  codeInputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  verifyButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 8,
  },
  resendText: {
    color: theme.colors.text + "60",
    fontSize: 14,
  },
  resendButton: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  phoneInputContainer: {
    marginBottom: 20,
  },
  phoneInput: {
    width: "100%",
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
  },
  phoneInputText: {
    backgroundColor: "transparent",
    paddingVertical: 0,
  },
  verificationOptions: {
    marginTop: 20,
    gap: 16,
  },
  verificationOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  verificationOptionText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    color: theme.colors.accent,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  securityQuestionsContainer: {
    marginTop: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 12,
  },
  questionContainer: {
    gap: 8,
  },
  questionText: {
    fontSize: 14,
    color: theme.colors.text + "CC",
  },
  recoveryOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary + "40",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recoveryOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: theme.colors.text,
  },
  authenticatorContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  authenticatorKey: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: "monospace",
    marginBottom: 16,
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
});
