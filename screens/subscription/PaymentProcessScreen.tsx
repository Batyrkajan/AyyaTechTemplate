import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import { useSubscription } from "../../contexts/SubscriptionContext";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

type Props = ScreenProps<"PaymentProcess">;

type PaymentMethod = "card" | "paypal" | "googlepay" | "applepay";

type PaymentMethodConfig = {
  id: PaymentMethod;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  available: boolean;
  comingSoon?: boolean;
};

const paymentMethods: PaymentMethodConfig[] = [
  {
    id: "card",
    name: "Credit Card",
    icon: "card",
    available: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "logo-paypal",
    available: true,
  },
  {
    id: "googlepay",
    name: "Google Pay",
    icon: "logo-google",
    available: Platform.OS === "android",
    comingSoon: Platform.OS === "ios",
  },
  {
    id: "applepay",
    name: "Apple Pay",
    icon: "logo-apple",
    available: Platform.OS === "ios",
    comingSoon: Platform.OS === "android",
  },
];

// Add validation types
type ValidationError = {
  field: keyof CardDetails;
  message: string;
};

type ValidationResult = ValidationError | null;

// Add validation functions
const validateCardNumber = (number: string): ValidationResult => {
  const cleaned = number.replace(/\s/g, "");
  if (!cleaned) {
    return { field: "number", message: "Card number is required" };
  }
  if (!/^\d{16}$/.test(cleaned)) {
    return {
      field: "number",
      message: "Please enter a valid 16-digit card number",
    };
  }
  return null;
};

const validateExpiry = (expiry: string): ValidationResult => {
  if (!expiry) {
    return { field: "expiry", message: "Expiry date is required" };
  }
  if (!expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
    return {
      field: "expiry",
      message: "Please enter a valid expiry date (MM/YY)",
    };
  }
  const [month, year] = expiry.split("/");
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  if (expiryDate < new Date()) {
    return { field: "expiry", message: "Card has expired" };
  }
  return null;
};

// Add card details type
type CardDetails = {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
};

export default function PaymentProcessScreen({ navigation, route }: Props) {
  const { plan } = route.params;
  const { subscription, addPaymentMethod } = useSubscription();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [saveCard, setSaveCard] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const methodTransition = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const validationScale = useRef(new Animated.Value(0)).current;

  // New animation values
  const loadingRotation = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const failureRotation = useRef(new Animated.Value(0)).current;
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "loading" | "success" | "failure"
  >("idle");

  // Additional animation values
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successRing = useRef(new Animated.Value(0)).current;
  const failureX = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(1)).current;

  // Additional animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnims = useRef(
    [...Array(5)].map(() => new Animated.Value(0))
  ).current;
  const confettiAnims = useRef(
    [...Array(20)].map(() => ({
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  // Additional animation values for new effects
  const glowAnims = useRef(
    [...Array(3)].map(() => new Animated.Value(0))
  ).current;
  const bubblesAnims = useRef(
    [...Array(10)].map(() => ({
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;
  const shockwaveAnim = useRef(new Animated.Value(0)).current;

  // Sound effects
  const [successSound, setSuccessSound] = useState<Audio.Sound>();
  const [errorSound, setErrorSound] = useState<Audio.Sound>();
  const [clickSound, setClickSound] = useState<Audio.Sound>();

  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      const { sound: success } = await Audio.Sound.createAsync(
        require("../../assets/sounds/success.mp3")
      );
      const { sound: error } = await Audio.Sound.createAsync(
        require("../../assets/sounds/error.mp3")
      );
      const { sound: click } = await Audio.Sound.createAsync(
        require("../../assets/sounds/click.mp3")
      );

      setSuccessSound(success);
      setErrorSound(error);
      setClickSound(click);
    };

    loadSounds();

    return () => {
      successSound?.unloadAsync();
      errorSound?.unloadAsync();
      clickSound?.unloadAsync();
    };
  }, []);

  useEffect(() => {
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
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePaymentMethodSelect = async (method: PaymentMethod) => {
    if (paymentMethods.find((m) => m.id === method)?.available) {
      try {
        await clickSound?.playFromPositionAsync(0);
      } catch (error) {
        console.log("Error playing click sound:", error);
      }

      setValidationErrors([]);

      // Animate method transition
      Animated.sequence([
        Animated.timing(methodTransition, {
          toValue: -50,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(methodTransition, {
          toValue: 0,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start();

      setPaymentMethod(method);
    } else {
      // Provide error feedback for unavailable methods
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 6,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -6,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showValidationError = () => {
    Animated.sequence([
      Animated.spring(validationScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(validationScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleValidationError = async () => {
    try {
      await errorSound?.playFromPositionAsync(0);
    } catch (error) {
      console.log("Error playing error sound:", error);
    }
    shakeError();
    showValidationError();
  };

  const validatePayment = async (): Promise<boolean> => {
    const errors: ValidationError[] = [];
    const validations = paymentValidations[paymentMethod];

    validations.forEach((validation) => {
      const error = validation.validate();
      if (error) {
        errors.push(error);
      }
    });

    setValidationErrors(errors);
    if (errors.length > 0) {
      await handleValidationError();
    }
    return errors.length === 0;
  };

  // Create loading animation
  const startLoadingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Create pulse animation
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Create sparkle animations
  const startSparkleAnimations = () => {
    const sparkleAnimations = sparkleAnims.map((anim, index) =>
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(100, sparkleAnimations).start();
  };

  // Create confetti animation
  const startConfettiAnimation = () => {
    const confettiAnimations = confettiAnims.map((anim, index) => {
      const angle = (index / confettiAnims.length) * Math.PI * 2;
      const radius = Math.random() * 100 + 50;
      const duration = Math.random() * 1000 + 1000;

      return Animated.parallel([
        Animated.sequence([
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim.position, {
            toValue: {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius - 100,
            },
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(anim.rotation, {
          toValue: Math.random() * 4 - 2,
          duration,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(50, confettiAnimations).start();
  };

  // Create glow animation
  const startGlowAnimations = () => {
    const glowAnimations = glowAnims.map((anim, index) =>
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.loop(Animated.stagger(200, glowAnimations)).start();
  };

  // Create bubble animation
  const startBubbleAnimations = () => {
    const bubbleAnimations = bubblesAnims.map((anim, index) => {
      const angle = (index / bubblesAnims.length) * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const duration = Math.random() * 1000 + 1500;

      return Animated.parallel([
        Animated.sequence([
          Animated.timing(anim.scale, {
            toValue: Math.random() * 0.5 + 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim.position, {
            toValue: {
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 200,
            },
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(anim.opacity, {
            toValue: 0.8,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: duration - 400,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.stagger(50, bubbleAnimations).start();
  };

  // Create shockwave animation
  const startShockwaveAnimation = () => {
    shockwaveAnim.setValue(0);
    Animated.timing(shockwaveAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  // Enhanced success animation
  const showSuccessAnimation = async () => {
    // Play success sound
    try {
      await successSound?.playFromPositionAsync(0);
    } catch (error) {
      console.log("Error playing success sound:", error);
    }

    // Reset and start animations
    startGlowAnimations();
    startBubbleAnimations();
    startShockwaveAnimation();

    // Reset animation values
    successScale.setValue(0);
    successOpacity.setValue(0);
    successRing.setValue(0);
    overlayOpacity.setValue(0);
    contentScale.setValue(1);

    startPulseAnimation();
    startSparkleAnimations();
    startConfettiAnimation();

    Animated.parallel([
      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      // Scale down content
      Animated.timing(contentScale, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
      // Success icon animation sequence
      Animated.sequence([
        // Pop in
        Animated.spring(successScale, {
          toValue: 1.2,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        // Settle
        Animated.spring(successScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      // Fade in success elements
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Expanding ring animation
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(successRing, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        navigation.replace("PaymentConfirmation");
      }, 2000);
    });
  };

  // Create enhanced failure animation
  const showFailureAnimation = () => {
    // Reset animation values
    failureRotation.setValue(0);
    failureX.setValue(0);
    overlayOpacity.setValue(0);

    Animated.parallel([
      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
      // Shake and X mark animation
      Animated.sequence([
        // Initial shake
        Animated.sequence([
          Animated.timing(failureRotation, {
            toValue: 0.1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(failureRotation, {
            toValue: -0.1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(failureRotation, {
            toValue: 0.07,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(failureRotation, {
            toValue: -0.07,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        // Draw X mark
        Animated.timing(failureX, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Fade out overlay
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        delay: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  const handlePayment = async () => {
    try {
      if (!(await validatePayment())) {
        return;
      }

      // Provide heavy feedback when starting payment
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setPaymentStatus("loading");
      startLoadingAnimation();

      // Save card if requested
      if (saveCard && paymentMethod === "card") {
        await addPaymentMethod({
          type: "card",
          details: `**** ${cardDetails.number.slice(-4)}`,
        });
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success (80% chance) or failure
      if (Math.random() > 0.2) {
        // Provide success feedback
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        setPaymentStatus("success");
        showSuccessAnimation();
      } else {
        throw new Error("Payment failed. Please try again.");
      }
    } catch (error) {
      // Provide error feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPaymentStatus("failure");
      showFailureAnimation();
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again."
      );
      setPaymentStatus("idle");
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return validationErrors.find((error) => error.field === field)?.message;
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleTextInput = async (
    field: keyof typeof cardDetails,
    text: string,
    formatter?: (value: string) => string
  ) => {
    const formattedText = formatter ? formatter(text) : text;

    // Provide light feedback for each keystroke
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setCardDetails({ ...cardDetails, [field]: formattedText });
    setValidationErrors(validationErrors.filter((e) => e.field !== field));
  };

  const renderPaymentMethodContent = () => {
    const content = (() => {
      switch (paymentMethod) {
        case "paypal":
          return (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.sectionTitle}>PayPal</Text>
              <TouchableOpacity
                style={styles.paypalButton}
                onPress={() => handlePayment()}
              >
                <Ionicons name="logo-paypal" size={24} color="#FFFFFF" />
                <Text style={styles.paypalButtonText}>Pay with PayPal</Text>
              </TouchableOpacity>
            </Animated.View>
          );

        case "googlepay":
        case "applepay":
          const isGoogle = paymentMethod === "googlepay";
          return (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.sectionTitle}>
                {isGoogle ? "Google Pay" : "Apple Pay"}
              </Text>
              <TouchableOpacity
                style={[
                  styles.walletButton,
                  isGoogle ? styles.googlePayButton : styles.applePayButton,
                ]}
                onPress={() => handlePayment()}
              >
                <Ionicons
                  name={isGoogle ? "logo-google" : "logo-apple"}
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.walletButtonText}>
                  Pay with {isGoogle ? "Google Pay" : "Apple Pay"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );

        default:
          return (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.sectionTitle}>Card Details</Text>
              <View style={styles.cardForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cardholder Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      getFieldError("name") && styles.inputError,
                    ]}
                    value={cardDetails.name}
                    onChangeText={(text) => handleTextInput("name", text)}
                    placeholder="Enter cardholder name"
                    placeholderTextColor={theme.colors.text + "60"}
                  />
                  {getFieldError("name") && (
                    <Text style={styles.errorText}>
                      {getFieldError("name")}
                    </Text>
                  )}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Card Number</Text>
                  <TextInput
                    style={[
                      styles.input,
                      getFieldError("number") && styles.inputError,
                    ]}
                    value={cardDetails.number}
                    onChangeText={(text) =>
                      handleTextInput("number", text, formatCardNumber)
                    }
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={theme.colors.text + "60"}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                  {getFieldError("number") && (
                    <Text style={styles.errorText}>
                      {getFieldError("number")}
                    </Text>
                  )}
                </View>
                <View style={styles.row}>
                  <View
                    style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}
                  >
                    <Text style={styles.label}>Expiry Date</Text>
                    <TextInput
                      style={[
                        styles.input,
                        getFieldError("expiry") && styles.inputError,
                      ]}
                      value={cardDetails.expiry}
                      onChangeText={(text) =>
                        handleTextInput("expiry", text, formatExpiryDate)
                      }
                      placeholder="MM/YY"
                      placeholderTextColor={theme.colors.text + "60"}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                    {getFieldError("expiry") && (
                      <Text style={styles.errorText}>
                        {getFieldError("expiry")}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                      style={[
                        styles.input,
                        getFieldError("cvv") && styles.inputError,
                      ]}
                      value={cardDetails.cvv}
                      onChangeText={(text) => handleTextInput("cvv", text)}
                      placeholder="123"
                      placeholderTextColor={theme.colors.text + "60"}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                    {getFieldError("cvv") && (
                      <Text style={styles.errorText}>
                        {getFieldError("cvv")}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </Animated.View>
          );
      }
    })();

    return (
      <Animated.View
        style={[
          styles.methodContent,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { translateX: methodTransition },
              { translateX: shakeAnimation },
            ],
          },
        ]}
      >
        {content}
        {validationErrors.length > 0 && (
          <Animated.View
            style={[
              styles.validationErrorContainer,
              {
                transform: [{ scale: validationScale }],
              },
            ]}
          >
            <Ionicons
              name="alert-circle"
              size={20}
              color={theme.colors.accent}
            />
            <Text style={styles.validationErrorText}>
              Please correct the errors above
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const renderPaymentButton = () => {
    const spin = loadingRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    const shake = failureRotation.interpolate({
      inputRange: [-0.1, 0.1],
      outputRange: ["-10deg", "10deg"],
    });

    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePayment}
        disabled={paymentStatus === "loading"}
      >
        <Animated.View
          style={[
            styles.payButton,
            {
              transform: [
                { scale: buttonScale },
                paymentStatus === "loading"
                  ? { rotate: spin }
                  : { rotate: "0deg" },
                paymentStatus === "failure"
                  ? { rotate: shake }
                  : { rotate: "0deg" },
                paymentStatus === "success"
                  ? { scale: successScale }
                  : { scale: 1 },
              ],
            },
          ]}
        >
          {paymentStatus === "loading" ? (
            <Ionicons name="sync" size={24} color={theme.colors.background} />
          ) : paymentStatus === "success" ? (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={theme.colors.background}
            />
          ) : (
            <Text style={styles.payButtonText}>Complete Payment</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Render sparkles
  const renderSparkles = () => (
    <>
      {sparkleAnims.map((anim, index) => {
        const angle = (index / sparkleAnims.length) * Math.PI * 2;
        const radius = 60;
        return (
          <Animated.View
            key={index}
            style={[
              styles.sparkle,
              {
                transform: [
                  { translateX: Math.cos(angle) * radius },
                  { translateY: Math.sin(angle) * radius },
                  { scale: anim },
                  { rotate: `${angle + Math.PI / 4}rad` },
                ],
                opacity: anim,
              },
            ]}
          >
            <View style={styles.sparkleLine} />
            <View
              style={[styles.sparkleLine, { transform: [{ rotate: "90deg" }] }]}
            />
          </Animated.View>
        );
      })}
    </>
  );

  // Render confetti
  const renderConfetti = () => (
    <>
      {confettiAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: [
                theme.colors.primary,
                theme.colors.accent,
                theme.colors.secondary,
              ][index % 3],
              transform: [
                { translateX: anim.position.x },
                { translateY: anim.position.y },
                { scale: anim.scale },
                {
                  rotate: anim.rotation.interpolate({
                    inputRange: [-2, 2],
                    outputRange: ["-180deg", "180deg"],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </>
  );

  // Render new effects
  const renderParticleEffects = () => (
    <>
      {/* Shockwave effect */}
      <Animated.View
        style={[
          styles.shockwave,
          {
            transform: [
              {
                scale: shockwaveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 2],
                }),
              },
            ],
            opacity: shockwaveAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.5, 0.2, 0],
            }),
          },
        ]}
      />

      {/* Glow effects */}
      {glowAnims.map((anim, index) => (
        <Animated.View
          key={`glow-${index}`}
          style={[
            styles.glow,
            {
              transform: [{ scale: anim }],
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        />
      ))}

      {/* Floating bubbles */}
      {bubblesAnims.map((anim, index) => (
        <Animated.View
          key={`bubble-${index}`}
          style={[
            styles.bubble,
            {
              transform: [
                { translateX: anim.position.x },
                { translateY: anim.position.y },
                { scale: anim.scale },
              ],
              opacity: anim.opacity,
            },
          ]}
        />
      ))}
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Secure Payment</Text>
      </View>

      <ScrollView style={styles.content}>
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.planSummary}>
            <Text style={styles.planName}>{plan.name} Plan</Text>
            <Text style={styles.planPrice}>
              ₺{plan.price[subscription.billingCycle]}
              <Text style={styles.billingPeriod}>
                /{subscription.billingCycle}
              </Text>
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodButton,
                  paymentMethod === method.id && styles.selectedMethod,
                  !method.available && styles.disabledMethod,
                ]}
                onPress={() => handlePaymentMethodSelect(method.id)}
                disabled={!method.available}
              >
                <Animated.View
                  style={[
                    styles.methodContent,
                    {
                      transform: [
                        {
                          scale:
                            paymentMethod === method.id
                              ? buttonScale
                              : new Animated.Value(1),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons
                    name={method.icon}
                    size={24}
                    color={
                      paymentMethod === method.id
                        ? theme.colors.background
                        : method.available
                        ? theme.colors.text
                        : theme.colors.text + "40"
                    }
                  />
                  <Text
                    style={[
                      styles.methodText,
                      paymentMethod === method.id && styles.selectedMethodText,
                      !method.available && styles.disabledMethodText,
                    ]}
                  >
                    {method.name}
                    {method.comingSoon && " (Coming Soon)"}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {renderPaymentMethodContent()}

        {renderPaymentButton()}

        <Animated.View
          style={[
            styles.securityInfo,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.securityText}>
            Your payment is secure and encrypted
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Success/Failure overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
      >
        {paymentStatus === "success" && (
          <View style={styles.successContainer}>
            {renderParticleEffects()}
            {renderSparkles()}
            {renderConfetti()}
            <Animated.View
              style={[
                styles.successRing,
                {
                  transform: [{ scale: successRing }],
                  opacity: Animated.multiply(successRing, 0.5),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.successIcon,
                {
                  transform: [{ scale: successScale }],
                  opacity: successOpacity,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={theme.colors.primary}
              />
            </Animated.View>
            <Animated.Text
              style={[
                styles.successText,
                {
                  opacity: successOpacity,
                  transform: [
                    { translateY: Animated.multiply(successOpacity, -20) },
                  ],
                },
              ]}
            >
              Payment Successful
            </Animated.Text>
          </View>
        )}

        {paymentStatus === "failure" && (
          <Animated.View
            style={[
              styles.failureIcon,
              {
                transform: [
                  {
                    rotate: failureRotation.interpolate({
                      inputRange: [-0.1, 0.1],
                      outputRange: ["-10deg", "10deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.failureX,
                {
                  opacity: failureX,
                  transform: [{ scale: failureX }],
                },
              ]}
            >
              <Ionicons
                name="close-circle"
                size={80}
                color={theme.colors.accent}
              />
            </Animated.View>
          </Animated.View>
        )}
      </Animated.View>

      {/* Scale content during success/failure */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: contentScale }],
          },
        ]}
      >
        {/* ... existing content ... */}
      </Animated.View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 16,
  },
  planSummary: {
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  billingPeriod: {
    fontSize: 14,
    color: theme.colors.text + "80",
  },
  paymentMethods: {
    flexDirection: "row",
    gap: 12,
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  selectedMethod: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  methodText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedMethodText: {
    color: theme.colors.background,
  },
  cardForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.secondary,
    padding: 12,
    borderRadius: 8,
    color: theme.colors.text,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
  },
  payButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  securityText: {
    marginLeft: 8,
    color: theme.colors.text + "80",
    fontSize: 14,
  },
  disabledMethod: {
    opacity: 0.5,
  },
  disabledMethodText: {
    color: theme.colors.text + "40",
  },
  paypalButton: {
    backgroundColor: "#0070BA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  paypalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  googlePayButton: {
    backgroundColor: "#000000",
  },
  applePayButton: {
    backgroundColor: "#000000",
  },
  walletButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  inputError: {
    borderColor: theme.colors.accent,
    borderWidth: 1,
  },
  errorText: {
    color: theme.colors.accent,
    fontSize: 12,
    marginTop: 4,
  },
  methodContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  validationErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.accent + "20",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  validationErrorText: {
    color: theme.colors.accent,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  successContainer: {
    alignItems: "center",
  },
  successRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  successIcon: {
    alignItems: "center",
  },
  successText: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.primary,
    marginTop: 16,
  },
  failureIcon: {
    alignItems: "center",
  },
  failureX: {
    alignItems: "center",
  },
  sparkle: {
    position: "absolute",
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sparkleLine: {
    position: "absolute",
    width: 20,
    height: 2,
    backgroundColor: theme.colors.primary,
  },
  confetti: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shockwave: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  glow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.primary,
  },
  bubble: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary + "40",
  },
});
