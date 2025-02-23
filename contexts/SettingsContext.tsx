import { createContext, useContext, useState, ReactNode } from "react";

type SettingsContextType = {
  language: string;
  darkMode: boolean;
  accentColor: string;
  autoUpdate: boolean;
  notifications: {
    push: boolean;
    email: boolean;
    sound: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
  };
  security: {
    twoFactor: boolean;
    alerts: boolean;
  };
  setLanguage: (lang: string) => void;
  setDarkMode: (enabled: boolean) => void;
  setAccentColor: (color: string) => void;
  setAutoUpdate: (enabled: boolean) => void;
  setNotifications: (settings: Partial<SettingsContextType["notifications"]>) => void;
  setPrivacy: (settings: Partial<SettingsContextType["privacy"]>) => void;
  setSecurity: (settings: Partial<SettingsContextType["security"]>) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState({
    language: "en",
    darkMode: true,
    accentColor: "blue",
    autoUpdate: true,
    notifications: {
      push: true,
      email: false,
      sound: true,
    },
    privacy: {
      dataSharing: false,
      analytics: true,
    },
    security: {
      twoFactor: false,
      alerts: true,
    },
  });

  const value: SettingsContextType = {
    ...settings,
    setLanguage: (lang) => setSettings((prev) => ({ ...prev, language: lang })),
    setDarkMode: (enabled) => setSettings((prev) => ({ ...prev, darkMode: enabled })),
    setAccentColor: (color) => setSettings((prev) => ({ ...prev, accentColor: color })),
    setAutoUpdate: (enabled) => setSettings((prev) => ({ ...prev, autoUpdate: enabled })),
    setNotifications: (newSettings) =>
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, ...newSettings },
      })),
    setPrivacy: (newSettings) =>
      setSettings((prev) => ({
        ...prev,
        privacy: { ...prev.privacy, ...newSettings },
      })),
    setSecurity: (newSettings) =>
      setSettings((prev) => ({
        ...prev,
        security: { ...prev.security, ...newSettings },
      })),
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
} 