import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Easing,
  Switch,
  Vibration,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme";
import type { ScreenProps } from "../../App";
import { useSubscription } from "../../contexts/SubscriptionContext";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = ScreenProps<"Dashboard">;

type DashboardOption = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: (nav: Props["navigation"]) => void;
  color?: string;
};

const getDashboardOptions = (nav: Props["navigation"]): DashboardOption[] => [
  {
    icon: "person-circle",
    label: "Profile",
    onPress: (nav) => nav.navigate("Profile"),
  },
  {
    icon: "settings-outline",
    label: "Settings",
    onPress: (nav) => nav.navigate("GeneralSettings"),
  },
  {
    icon: "notifications-outline",
    label: "Notifications",
    onPress: (nav) => nav.navigate("NotificationSettings"),
  },
  {
    icon: "shield-outline",
    label: "Privacy & Security",
    onPress: (nav) => nav.navigate("PrivacySettings"),
  },
  {
    icon: "help-circle-outline",
    label: "Help & Support",
    onPress: () => {
      // TODO: Implement help & support
    },
  },
  {
    icon: "information-circle-outline",
    label: "About",
    onPress: () => {
      // TODO: Implement about
    },
  },
  {
    icon: "log-out",
    label: "Logout",
    onPress: (nav) => {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Logout",
            style: "destructive",
            onPress: () => nav.replace("Welcome"),
          },
        ],
        { cancelable: true }
      );
    },
    color: theme.colors.accent,
  },
];

type UsageStats = {
  daily: number[];
  labels: string[];
  total: number;
  limit: number;
};

const mockUsageStats: UsageStats = {
  daily: [30, 45, 28, 80, 99, 43, 50],
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  total: 375,
  limit: 500,
};

type ActivityItem = {
  id: string;
  type: "payment" | "upgrade" | "usage" | "alert";
  title: string;
  description: string;
  timestamp: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const recentActivity: ActivityItem[] = [
  {
    id: "1",
    type: "payment",
    title: "Payment Successful",
    description: "Monthly subscription renewed",
    timestamp: "2h ago",
    icon: "checkmark-circle",
  },
  {
    id: "2",
    type: "usage",
    title: "High Usage Alert",
    description: "80% of monthly limit reached",
    timestamp: "1d ago",
    icon: "trending-up",
  },
  // ... add more activity items
];

type QuickAction = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
};

type UsageBreakdown = {
  category: string;
  amount: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Update quick actions
const getQuickActions = (nav: Props["navigation"]): QuickAction[] => [
  {
    id: "upgrade",
    icon: "trending-up",
    label: "Upgrade Plan",
    onPress: () => nav.navigate("SubscriptionPlans"),
    color: theme.colors.primary,
  },
  {
    id: "payment",
    icon: "card",
    label: "Payment Methods",
    onPress: () => nav.navigate("PaymentMethods"),
    color: "#4CAF50",
  },
  {
    id: "support",
    icon: "chatbubble-ellipses",
    label: "Get Support",
    onPress: () => {
      /* TODO: Implement support */
    },
    color: "#2196F3",
  },
  {
    id: "share",
    icon: "share-social",
    label: "Share App",
    onPress: () => {
      /* TODO: Implement share */
    },
    color: "#9C27B0",
  },
];

const usageBreakdown: UsageBreakdown[] = [
  {
    category: "API Calls",
    amount: 245,
    color: "#4CAF50",
    icon: "code-working",
  },
  {
    category: "Storage",
    amount: 80,
    color: "#2196F3",
    icon: "cloud-upload",
  },
  {
    category: "Bandwidth",
    amount: 50,
    color: "#9C27B0",
    icon: "wifi",
  },
];

// Add new types
type WidgetTheme = {
  id: string;
  name: string;
  colors: {
    background: string;
    text: string;
    accent: string;
  };
};

type WidgetLayout = 'compact' | 'normal' | 'expanded';

type WidgetCustomization = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  layouts?: WidgetLayout[];
  refreshIntervals?: number[];
  theme?: string;
};

type WidgetConfig = {
  id: string;
  visible: boolean;
  order: number;
  theme: string;
  layout: WidgetLayout;
  refreshInterval: number;
  expanded?: boolean;
};

// Add themes
const widgetThemes: WidgetTheme[] = [
  {
    id: "default",
    name: "Default",
    colors: {
      background: theme.colors.secondary,
      text: theme.colors.text,
      accent: theme.colors.primary,
    },
  },
  {
    id: "dark",
    name: "Dark",
    colors: {
      background: "#1A1A1A",
      text: "#FFFFFF",
      accent: "#00C853",
    },
  },
  {
    id: "light",
    name: "Light",
    colors: {
      background: "#F5F5F5",
      text: "#000000",
      accent: "#1976D2",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      background: "#1A2B3C",
      text: "#E0F2FF",
      accent: "#00B4DB",
    },
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      background: "#1B2819",
      text: "#E8F5E3",
      accent: "#4CAF50",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: {
      background: "#2D1B2E",
      text: "#FFE4E1",
      accent: "#FF6B6B",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    colors: {
      background: "#FFFFFF",
      text: "#2C3E50",
      accent: "#34495E",
    },
  },
  {
    id: "neon",
    name: "Neon",
    colors: {
      background: "#0A0A0A",
      text: "#FFFFFF",
      accent: "#00FF9D",
    },
  },
  // Add more themes...
];

// Add customization options
const widgetOptions: WidgetCustomization[] = [
  {
    id: "usage",
    title: "Usage Statistics",
    icon: "stats-chart",
    description: "Monitor your usage patterns and trends",
    layouts: ["compact", "normal", "expanded"],
    refreshIntervals: [5, 15, 30, 60],
  },
  {
    id: "activity",
    title: "Recent Activity",
    icon: "time",
    description: "Display recent account activities",
  },
  {
    id: "quickActions",
    title: "Quick Actions",
    icon: "flash",
    description: "Quick access to common actions",
  },
  {
    id: "breakdown",
    title: "Usage Breakdown",
    icon: "pie-chart",
    description: "Detailed breakdown of your usage",
  },
];

// Add new types
type ExportData = {
  version: number;
  timestamp: string;
  configs: WidgetConfig[];
  themes: WidgetTheme[];
};

// Add new types
type CustomTheme = WidgetTheme & {
  isCustom: true;
  lastModified: string;
};

type BackupData = {
  version: number;
  timestamp: string;
  configs: WidgetConfig[];
  themes: (WidgetTheme | CustomTheme)[];
  lastBackup?: string;
};

// Add layout preview component
const LayoutPreview = ({
  layout,
  theme,
}: {
  layout: WidgetLayout;
  theme: WidgetTheme;
}) => {
  const getLayoutStyle = () => {
    switch (layout) {
      case "compact":
        return {
          height: 80,
          padding: 12,
        };
      case "expanded":
        return {
          height: 200,
          padding: 16,
        };
      default:
        return {
          height: 140,
          padding: 16,
        };
    }
  };

  return (
    <View
      style={[
        styles.layoutPreview,
        getLayoutStyle(),
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Preview content based on layout */}
      <View style={styles.layoutPreviewHeader}>
        <View
          style={[
            styles.layoutPreviewTitle,
            { backgroundColor: theme.colors.text + "20" },
          ]}
        />
        {layout !== "compact" && (
          <View
            style={[
              styles.layoutPreviewAction,
              { backgroundColor: theme.colors.accent + "20" },
            ]}
          />
        )}
      </View>

      {layout !== "compact" && (
        <View style={styles.layoutPreviewContent}>
          <View
            style={[
              styles.layoutPreviewBar,
              { backgroundColor: theme.colors.text + "20" },
            ]}
          />
          {layout === "expanded" && (
            <>
              <View
                style={[
                  styles.layoutPreviewBar,
                  { backgroundColor: theme.colors.text + "20" },
                ]}
              />
              <View
                style={[
                  styles.layoutPreviewBar,
                  { backgroundColor: theme.colors.text + "20" },
                ]}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

// Add color picker component
const ColorPicker = ({
  color,
  onColorChange,
  label,
}: {
  color: string;
  onColorChange: (color: string) => void;
  label: string;
}) => {
  const predefinedColors = [
    "#1976D2",
    "#4CAF50",
    "#FF6B6B",
    "#9C27B0",
    "#FF9800",
    "#00BCD4",
    "#FFFFFF",
    "#000000",
  ];

  return (
    <View style={styles.colorPicker}>
      <Text style={styles.colorPickerLabel}>{label}</Text>
      <View style={styles.colorGrid}>
        {predefinedColors.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorOption,
              { backgroundColor: c },
              color === c && styles.colorOptionSelected,
            ]}
            onPress={() => onColorChange(c)}
          />
        ))}
      </View>
      <TextInput
        style={styles.colorInput}
        value={color}
        onChangeText={onColorChange}
        placeholder="#RRGGBB"
        placeholderTextColor={theme.colors.text + "40"}
      />
    </View>
  );
};

export default function DashboardScreen({ navigation }: Props) {
  const { subscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Sound effects
  const [tapSound, setTapSound] = useState<Audio.Sound>();
  const [successSound, setSuccessSound] = useState<Audio.Sound>();

  // Add dashboard menu animations
  const menuAnimations = useRef(
    getDashboardOptions(navigation).map(() => ({
      scale: new Animated.Value(1),
      slide: new Animated.Value(100),
      opacity: new Animated.Value(0),
    }))
  ).current;

  // Add widget animations
  const chartAnim = useRef(new Animated.Value(0)).current;
  const activityAnim = useRef(new Animated.Value(0)).current;

  // Add new animation values
  const quickActionsAnim = useRef(new Animated.Value(0)).current;
  const breakdownAnim = useRef(new Animated.Value(0)).current;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Add widget customization state
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>([]);

  // Add long press handling
  const longPressTimeout = useRef<ReturnType<typeof setTimeout>>();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Add new custom themes
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);

  // Get quick actions with navigation
  const quickActions = getQuickActions(navigation);

  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      const { sound: tap } = await Audio.Sound.createAsync(
        require("../../assets/sounds/tap.mp3")
      );
      const { sound: success } = await Audio.Sound.createAsync(
        require("../../assets/sounds/success.mp3")
      );

      setTapSound(tap);
      setSuccessSound(success);
    };

    loadSounds();

    return () => {
      tapSound?.unloadAsync();
      successSound?.unloadAsync();
    };
  }, []);

  // Initial animations
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

    // Start pulse animation for active subscription
    if (subscription.status === "active") {
      startPulseAnimation();
    }
  }, []);

  useEffect(() => {
    // Stagger menu items entrance
    Animated.stagger(
      50,
      menuAnimations.map((anim, index) =>
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(anim.slide, {
            toValue: 0,
            duration: 400,
            delay: index * 50,
            easing: Easing.out(Easing.back(1.7)),
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 400,
            delay: index * 50,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();

    // Animate widgets
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(chartAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(activityAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(quickActionsAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(breakdownAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startGlowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleCardPress = async () => {
    try {
      await tapSound?.playFromPositionAsync(0);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log("Error playing sound:", error);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate("ManageSubscription");
  };

  const handleOptionPress = async (option: DashboardOption) => {
    try {
      await tapSound?.playFromPositionAsync(0);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log("Error playing sound:", error);
    }

    option.onPress(navigation);
  };

  const handleCategoryPress = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleWidgetLongPress = (widgetId: string) => {
    Vibration.vibrate(100);
    setIsCustomizing(true);
    setDraggedWidget(widgetId);
  };

  const handleWidgetDrop = (toIndex: number) => {
    if (!draggedWidget) return;

    setWidgetConfigs((current) => {
      const newConfigs = [...current];
      const fromIndex = newConfigs.findIndex((w) => w.id === draggedWidget);
      const [movedWidget] = newConfigs.splice(fromIndex, 1);
      newConfigs.splice(toIndex, 0, movedWidget);
      return newConfigs.map((w, i) => ({ ...w, order: i }));
    });

    setDraggedWidget(null);
    Vibration.vibrate(50);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgetConfigs((current) =>
      current.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    );
    Vibration.vibrate(50);
  };

  const toggleWidgetExpansion = (widgetId: string) => {
    setWidgetConfigs((current) =>
      current.map((w) =>
        w.id === widgetId ? { ...w, expanded: !w.expanded } : w
      )
    );
  };

  const loadWidgetConfigs = async () => {
    try {
      const savedConfigs = await AsyncStorage.getItem("@widget_configs");
      if (savedConfigs) {
        setWidgetConfigs(JSON.parse(savedConfigs));
      } else {
        // Set default configurations
        const defaultConfigs: WidgetConfig[] = widgetOptions.map(
          (widget, index) => ({
            id: widget.id,
            visible: true,
            order: index,
            theme: "default",
            layout: "normal",
            refreshInterval: 15,
          })
        );
        await saveWidgetConfigs(defaultConfigs);
        setWidgetConfigs(defaultConfigs);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading widget configs:", error);
      setIsLoading(false);
    }
  };

  const saveWidgetConfigs = async (configs: WidgetConfig[]) => {
    try {
      await AsyncStorage.setItem("@widget_configs", JSON.stringify(configs));
    } catch (error) {
      console.error("Error saving widget configs:", error);
    }
  };

  const updateWidgetConfig = async (
    id: string,
    updates: Partial<WidgetConfig>
  ) => {
    const newConfigs = widgetConfigs.map((config) =>
      config.id === id ? { ...config, ...updates } : config
    );
    setWidgetConfigs(newConfigs);
    await saveWidgetConfigs(newConfigs);
  };

  const renderUsageWidget = () => (
    <Animated.View
      style={[
        styles.widget,
        {
          opacity: chartAnim,
          transform: [
            {
              translateY: chartAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetTitle}>Usage Statistics</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("UsageStats")}
          style={styles.widgetAction}
        >
          <Text style={styles.widgetActionText}>Details</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <LineChart
        data={{
          labels: mockUsageStats.labels,
          datasets: [
            {
              data: mockUsageStats.daily,
            },
          ],
        }}
        width={SCREEN_WIDTH - 40}
        height={180}
        chartConfig={{
          backgroundColor: theme.colors.secondary,
          backgroundGradientFrom: theme.colors.secondary,
          backgroundGradientTo: theme.colors.secondary,
          decimalPlaces: 0,
          color: (opacity = 1) =>
            theme.colors.primary + opacity.toString(16).padStart(2, "0"),
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />

      <View style={styles.usageInfo}>
        <View style={styles.usageItem}>
          <Text style={styles.usageLabel}>Total Usage</Text>
          <Text style={styles.usageValue}>{mockUsageStats.total}</Text>
        </View>
        <View style={styles.usageItem}>
          <Text style={styles.usageLabel}>Limit</Text>
          <Text style={styles.usageValue}>{mockUsageStats.limit}</Text>
        </View>
        <View style={styles.usageItem}>
          <Text style={styles.usageLabel}>Remaining</Text>
          <Text style={styles.usageValue}>
            {mockUsageStats.limit - mockUsageStats.total}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderActivityWidget = () => (
    <Animated.View
      style={[
        styles.widget,
        {
          opacity: activityAnim,
          transform: [
            {
              translateY: activityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetTitle}>Recent Activity</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ActivityHistory")}
          style={styles.widgetAction}
        >
          <Text style={styles.widgetActionText}>View All</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {recentActivity.map((activity) => (
        <View key={activity.id} style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Ionicons
              name={activity.icon}
              size={24}
              color={
                activity.type === "payment"
                  ? theme.colors.primary
                  : activity.type === "alert"
                  ? theme.colors.accent
                  : theme.colors.text
              }
            />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>
              {activity.description}
            </Text>
          </View>
          <Text style={styles.activityTime}>{activity.timestamp}</Text>
        </View>
      ))}
    </Animated.View>
  );

  const renderQuickActionsWidget = () => (
    <Animated.View style={[styles.widget, styles.quickActionsWidget]}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetTitle}>Quick Actions</Text>
      </View>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickAction}
            onPress={action.onPress}
          >
            <Ionicons name={action.icon} size={24} color={action.color} />
            <Text style={[styles.quickActionText, { color: action.color }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderUsageBreakdownWidget = () => (
    <Animated.View
      style={[
        styles.widget,
        {
          opacity: breakdownAnim,
          transform: [
            {
              translateY: breakdownAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.widgetTitle}>Usage Breakdown</Text>
      {usageBreakdown.map((item) => (
        <TouchableOpacity
          key={item.category}
          style={[
            styles.breakdownItem,
            expandedCategory === item.category && styles.breakdownItemExpanded,
          ]}
          onPress={() => handleCategoryPress(item.category)}
        >
          <View style={styles.breakdownHeader}>
            <View
              style={[
                styles.breakdownIcon,
                { backgroundColor: item.color + "20" },
              ]}
            >
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.breakdownInfo}>
              <Text style={styles.breakdownCategory}>{item.category}</Text>
              <Text style={styles.breakdownAmount}>{item.amount} units</Text>
            </View>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate:
                      expandedCategory === item.category ? "180deg" : "0deg",
                  },
                ],
              }}
            >
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.colors.text + "60"}
              />
            </Animated.View>
          </View>
          {expandedCategory === item.category && (
            <View style={styles.breakdownDetails}>
              <Text style={styles.breakdownDetailText}>
                Daily Average: {(item.amount / 7).toFixed(1)} units
              </Text>
              <Text style={styles.breakdownDetailText}>
                Trend: +5% from last week
              </Text>
              <TouchableOpacity
                style={styles.breakdownDetailButton}
                onPress={() => {
                  /* TODO: Navigate to detailed view */
                }}
              >
                <Text style={styles.breakdownDetailButtonText}>
                  View Details
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  // Add customization menu
  const renderCustomizationMenu = () => (
    <Animated.View
      style={[
        styles.customizationMenu,
        {
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-300, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.customizationHeader}>
        <Text style={styles.customizationTitle}>Customize Dashboard</Text>
        <TouchableOpacity
          onPress={() => setIsCustomizing(false)}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {widgetOptions.map((widget) => (
        <View key={widget.id} style={styles.customizationItem}>
          <View style={styles.customizationInfo}>
            <Ionicons
              name={widget.icon}
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.customizationText}>
              <Text style={styles.customizationItemTitle}>{widget.title}</Text>
              <Text style={styles.customizationDescription}>
                {widget.description}
              </Text>
            </View>
          </View>
          <Switch
            value={
              widgetConfigs.find((w) => w.id === widget.id)?.visible ?? false
            }
            onValueChange={() => toggleWidgetVisibility(widget.id)}
            trackColor={{
              false: theme.colors.text + "40",
              true: theme.colors.primary + "40",
            }}
            thumbColor={
              widgetConfigs.find((w) => w.id === widget.id)?.visible
                ? theme.colors.primary
                : theme.colors.text
            }
          />
        </View>
      ))}
    </Animated.View>
  );

  // Add widget customization menu
  const renderWidgetCustomizationMenu = (widget: WidgetCustomization) => {
    const config = widgetConfigs.find((c) => c.id === widget.id);
    if (!config) return null;

    return (
      <View style={styles.customizationSection}>
        <Text style={styles.customizationSectionTitle}>
          {widget.title} Settings
        </Text>

        {/* Theme Selection */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Theme</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {widgetThemes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor:
                      config.theme === theme.id
                        ? theme.colors.accent
                        : "transparent",
                  },
                ]}
                onPress={() =>
                  updateWidgetConfig(widget.id, { theme: theme.id })
                }
              >
                <Text style={[styles.themeText, { color: theme.colors.text }]}>
                  {theme.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Layout Selection */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Layout</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.layoutPreviewContainer}
          >
            {widget.layouts?.map((layout) => {
              const theme =
                widgetThemes.find((t) => t.id === config.theme) ||
                widgetThemes[0];
              return (
                <TouchableOpacity
                  key={layout}
                  style={[
                    styles.layoutPreviewWrapper,
                    config.layout === layout && styles.layoutPreviewSelected,
                  ]}
                  onPress={() => updateWidgetConfig(widget.id, { layout })}
                >
                  <LayoutPreview layout={layout} theme={theme} />
                  <Text style={styles.layoutPreviewText}>
                    {layout.charAt(0).toUpperCase() + layout.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Refresh Interval */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Refresh Interval</Text>
          <View style={styles.refreshOptions}>
            {widget.refreshIntervals?.map((interval) => (
              <TouchableOpacity
                key={interval}
                style={[
                  styles.refreshOption,
                  config.refreshInterval === interval &&
                    styles.refreshOptionSelected,
                ]}
                onPress={() =>
                  updateWidgetConfig(widget.id, { refreshInterval: interval })
                }
              >
                <Text style={styles.refreshOptionText}>{interval} min</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Update widget rendering to use configurations
  const renderWidget = (widget: WidgetCustomization) => {
    const config = widgetConfigs.find((c) => c.id === widget.id);
    if (!config || !config.visible) return null;

    const theme =
      widgetThemes.find((t) => t.id === config.theme) || widgetThemes[0];

    return (
      <Animated.View
        style={[
          styles.widget,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        {/* Widget content with applied theme and layout */}
        {/* ... existing widget content ... */}
      </Animated.View>
    );
  };

  // Add export/import functions
  const exportWidgetData = async () => {
    try {
      const exportData: ExportData = {
        version: 1,
        timestamp: new Date().toISOString(),
        configs: widgetConfigs,
        themes: widgetThemes,
      };

      const fileUri = `${FileSystem.documentDirectory}widget_configs.json`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2)
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error("Error exporting widget data:", error);
      Alert.alert("Export Error", "Failed to export widget configuration");
    }
  };

  const handleImportConfig = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (result.assets && result.assets.length > 0) {
        const content = await FileSystem.readAsStringAsync(
          result.assets[0].uri
        );
        const importData: ExportData = JSON.parse(content);
        // ... rest of import logic
      }
    } catch (error) {
      console.error("Import error:", error);
      Alert.alert("Error", "Failed to import configuration");
    }
  };

  // Load custom themes
  useEffect(() => {
    loadCustomThemes();
  }, []);

  const loadCustomThemes = async () => {
    try {
      const saved = await AsyncStorage.getItem("@custom_themes");
      if (saved) {
        setCustomThemes(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading custom themes:", error);
    }
  };

  const saveCustomThemes = async (themes: CustomTheme[]) => {
    try {
      await AsyncStorage.setItem("@custom_themes", JSON.stringify(themes));
      setCustomThemes(themes);
    } catch (error) {
      console.error("Error saving custom themes:", error);
    }
  };

  const createCustomTheme = () => {
    const newTheme: CustomTheme = {
      id: `custom_${Date.now()}`,
      name: "Custom Theme",
      isCustom: true,
      lastModified: new Date().toISOString(),
      colors: {
        background: theme.colors.secondary,
        text: theme.colors.text,
        accent: theme.colors.primary,
      },
    };
    setEditingTheme(newTheme);
    setIsEditingTheme(true);
  };

  const saveCustomTheme = async () => {
    if (!editingTheme) return;

    const updated = editingTheme.id.startsWith("custom_")
      ? [...customThemes.filter((t) => t.id !== editingTheme.id), editingTheme]
      : [...customThemes, editingTheme];

    await saveCustomThemes(updated);
    setIsEditingTheme(false);
    setEditingTheme(null);
  };

  // Add backup/restore functions
  const createBackup = async () => {
    try {
      const backupData: BackupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        configs: widgetConfigs,
        themes: [...widgetThemes, ...customThemes],
        lastBackup: new Date().toISOString(),
      };

      const backupFileName = `dashboard_backup_${Date.now()}.json`;
      const backupUri = `${FileSystem.documentDirectory}${backupFileName}`;

      await FileSystem.writeAsStringAsync(
        backupUri,
        JSON.stringify(backupData, null, 2)
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(backupUri, {
          mimeType: "application/json",
          dialogTitle: "Save Dashboard Backup",
        });
      }

      Alert.alert("Success", "Backup created successfully");
    } catch (error) {
      console.error("Error creating backup:", error);
      Alert.alert("Error", "Failed to create backup");
    }
  };

  const restoreBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (!result.canceled) {
        const content = await FileSystem.readAsStringAsync(
          result.assets[0].uri
        );
        const backupData: BackupData = JSON.parse(content);

        if (backupData.version !== 1) {
          throw new Error("Unsupported backup version");
        }

        // Restore configurations
        await saveWidgetConfigs(backupData.configs);
        setWidgetConfigs(backupData.configs);

        // Restore custom themes
        const customThemesFromBackup = backupData.themes.filter(
          (t): t is CustomTheme => "isCustom" in t && t.isCustom
        );
        await saveCustomThemes(customThemesFromBackup);

        Alert.alert("Success", "Dashboard restored successfully");
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      Alert.alert("Error", "Failed to restore backup");
    }
  };

  // Add theme editor modal
  const renderThemeEditor = () => (
    <View style={styles.themeEditor}>
      <View style={styles.themeEditorHeader}>
        <Text style={styles.themeEditorTitle}>Edit Theme</Text>
        <TextInput
          style={styles.themeNameInput}
          value={editingTheme?.name}
          onChangeText={(text) =>
            setEditingTheme((prev) => (prev ? { ...prev, name: text } : null))
          }
          placeholder="Theme Name"
          placeholderTextColor={theme.colors.text + "40"}
        />
      </View>

      <ColorPicker
        label="Background Color"
        color={editingTheme?.colors.background || ""}
        onColorChange={(color) =>
          setEditingTheme((prev) =>
            prev
              ? { ...prev, colors: { ...prev.colors, background: color } }
              : null
          )
        }
      />

      <ColorPicker
        label="Text Color"
        color={editingTheme?.colors.text || ""}
        onColorChange={(color) =>
          setEditingTheme((prev) =>
            prev ? { ...prev, colors: { ...prev.colors, text: color } } : null
          )
        }
      />

      <ColorPicker
        label="Accent Color"
        color={editingTheme?.colors.accent || ""}
        onColorChange={(color) =>
          setEditingTheme((prev) =>
            prev ? { ...prev, colors: { ...prev.colors, accent: color } } : null
          )
        }
      />

      <View style={styles.themeEditorActions}>
        <TouchableOpacity
          style={[styles.themeEditorButton, styles.themeEditorCancelButton]}
          onPress={() => {
            setIsEditingTheme(false);
            setEditingTheme(null);
          }}
        >
          <Text style={styles.themeEditorButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.themeEditorButton, styles.themeEditorSaveButton]}
          onPress={saveCustomTheme}
        >
          <Text style={styles.themeEditorButtonText}>Save Theme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Dashboard</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.subscriptionCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
              subscription.status === "active"
                ? { scale: pulseAnim }
                : { scale: 1 },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={handleCardPress}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Plan</Text>
            <Animated.View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    subscription.status === "active"
                      ? theme.colors.primary + "20"
                      : theme.colors.accent + "20",
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      subscription.status === "active"
                        ? theme.colors.primary
                        : theme.colors.accent,
                  },
                ]}
              >
                {subscription.status.charAt(0).toUpperCase() +
                  subscription.status.slice(1)}
              </Text>
            </Animated.View>
          </View>

          {subscription.currentPlan ? (
            <>
              <Text style={styles.planName}>
                {subscription.currentPlan.name}
              </Text>
              <Text style={styles.planPrice}>
                ₺{subscription.currentPlan.price[subscription.billingCycle]}
                <Text style={styles.billingPeriod}>
                  /{subscription.billingCycle}
                </Text>
              </Text>
              {subscription.nextBilling && (
                <Text style={styles.nextBilling}>
                  Next billing:{" "}
                  {new Date(subscription.nextBilling).toLocaleDateString()}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.noPlan}>No active subscription</Text>
          )}

          <Animated.View
            style={[
              styles.manageButton,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.primary}
            />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {isCustomizing && renderCustomizationMenu()}

      {widgetConfigs
        .filter((w) => w.visible)
        .sort((a, b) => a.order - b.order)
        .map((widget) => {
          switch (widget.id) {
            case "usage":
              return (
                <TouchableOpacity
                  key={widget.id}
                  onLongPress={() => handleWidgetLongPress(widget.id)}
                  delayLongPress={500}
                >
                  {renderUsageWidget()}
                </TouchableOpacity>
              );
            case "activity":
              return (
                <TouchableOpacity
                  key={widget.id}
                  onLongPress={() => handleWidgetLongPress(widget.id)}
                  delayLongPress={500}
                >
                  {renderActivityWidget()}
                </TouchableOpacity>
              );
            case "quickActions":
              return (
                <TouchableOpacity
                  key={widget.id}
                  onLongPress={() => handleWidgetLongPress(widget.id)}
                  delayLongPress={500}
                >
                  {renderQuickActionsWidget()}
                </TouchableOpacity>
              );
            case "breakdown":
              return (
                <TouchableOpacity
                  key={widget.id}
                  onLongPress={() => handleWidgetLongPress(widget.id)}
                  delayLongPress={500}
                >
                  {renderUsageBreakdownWidget()}
                </TouchableOpacity>
              );
          }
        })}

      <View style={styles.menuContainer}>
        {getDashboardOptions(navigation).map((option, index) => (
          <Animated.View
            key={option.label}
            style={[
              styles.menuItem,
              {
                opacity: menuAnimations[index].opacity,
                transform: [
                  { scale: menuAnimations[index].scale },
                  { translateY: menuAnimations[index].slide },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon}
                size={24}
                color={option.color || theme.colors.text}
              />
              <Text
                style={[
                  styles.menuText,
                  option.color && { color: option.color },
                ]}
              >
                {option.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={option.color || theme.colors.text + "80"}
              />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  subscriptionCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    margin: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 8,
  },
  billingPeriod: {
    fontSize: 16,
    color: theme.colors.text + "80",
  },
  nextBilling: {
    fontSize: 14,
    color: theme.colors.text + "80",
    marginBottom: 16,
  },
  noPlan: {
    fontSize: 16,
    color: theme.colors.text + "80",
    marginBottom: 16,
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.primary + "20",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  menuContainer: {
    padding: 20,
    paddingTop: 0,
  },
  menuItem: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
    marginLeft: 12,
  },
  widget: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    margin: 20,
    marginTop: 0,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  widgetAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  widgetActionText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginRight: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  usageInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  usageItem: {
    alignItems: "center",
  },
  usageLabel: {
    fontSize: 12,
    color: theme.colors.text + "80",
    marginBottom: 4,
  },
  usageValue: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text + "10",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.text + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
    color: theme.colors.text + "80",
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.text + "60",
    marginLeft: 8,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  quickAction: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  quickActionText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: "center",
  },
  breakdownItem: {
    backgroundColor: theme.colors.secondary + "40",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  breakdownItemExpanded: {
    backgroundColor: theme.colors.secondary + "60",
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  breakdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownCategory: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: 2,
  },
  breakdownAmount: {
    fontSize: 14,
    color: theme.colors.text + "80",
  },
  breakdownDetails: {
    padding: 12,
    paddingTop: 0,
  },
  breakdownDetailText: {
    fontSize: 14,
    color: theme.colors.text + "80",
    marginBottom: 8,
  },
  breakdownDetailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary + "20",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  breakdownDetailButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginRight: 8,
  },
  customizationMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 20,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  customizationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  customizationTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  customizationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text + "10",
  },
  customizationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  customizationText: {
    marginLeft: 12,
    flex: 1,
  },
  customizationItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: 2,
  },
  customizationDescription: {
    fontSize: 14,
    color: theme.colors.text + "80",
  },
  customizationSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
  },
  customizationSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 16,
  },
  settingGroup: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    color: theme.colors.text + "80",
    marginBottom: 8,
  },
  themeOption: {
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
  },
  themeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  layoutOptions: {
    flexDirection: "row",
    gap: 12,
  },
  layoutOption: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.secondary + "40",
  },
  layoutOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  layoutOptionText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  refreshOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  refreshOption: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.secondary + "40",
  },
  refreshOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  refreshOptionText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  layoutPreview: {
    width: 160,
    borderRadius: 8,
    overflow: "hidden",
  },
  layoutPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  layoutPreviewTitle: {
    width: 80,
    height: 12,
    borderRadius: 6,
  },
  layoutPreviewAction: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  layoutPreviewContent: {
    gap: 8,
  },
  layoutPreviewBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  layoutPreviewContainer: {
    marginTop: 12,
  },
  layoutPreviewWrapper: {
    marginRight: 16,
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  layoutPreviewSelected: {
    borderColor: theme.colors.primary,
  },
  layoutPreviewText: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 8,
    textAlign: "center",
  },
  themeEditor: {
    backgroundColor: theme.colors.background,
    padding: 20,
    borderRadius: 16,
    maxHeight: "80%",
  },
  themeEditorHeader: {
    marginBottom: 20,
  },
  themeEditorTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 12,
  },
  themeNameInput: {
    fontSize: 16,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text + "20",
    paddingVertical: 8,
  },
  colorPicker: {
    marginBottom: 20,
  },
  colorPickerLabel: {
    fontSize: 14,
    color: theme.colors.text + "80",
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: theme.colors.primary,
  },
  colorInput: {
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.text + "20",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  themeEditorActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  themeEditorButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  themeEditorCancelButton: {
    backgroundColor: theme.colors.text + "20",
  },
  themeEditorSaveButton: {
    backgroundColor: theme.colors.primary,
  },
  themeEditorButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.background,
  },
  quickActionsWidget: {
    marginTop: 20,
  },
});
