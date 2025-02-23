export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  profilePicture?: string;
  createdAt: string;
  lastLoginAt: string;
  completionPercentage: number;
  isEmailVerified: boolean;
  preferences: {
    darkMode: boolean;
    language: string;
    notifications: {
      push: boolean;
      email: boolean;
    };
    dataSharing: boolean;
  };
}

export interface ProfileUpdateData extends Partial<
  Pick<UserProfile, "fullName" | "email" | "phoneNumber" | "bio" | "profilePicture">
> {}

export interface ActivityLog {
  id: string;
  type: "login" | "profile_update" | "settings_change";
  description: string;
  timestamp: string;
} 