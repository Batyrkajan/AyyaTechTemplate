import AsyncStorage from '@react-native-async-storage/async-storage';

export type VerificationMethod = 'email' | 'phone' | 'biometric' | 'authenticator' | 'security_questions';

export type SecurityQuestion = {
  id: string;
  question: string;
  answer: string;
};

export type RecoveryOption = {
  type: 'backup_email' | 'backup_phone' | 'recovery_codes' | 'security_questions';
  value: string;
};

export type VerificationState = {
  primaryMethod: VerificationMethod;
  backupMethods: VerificationMethod[];
  recoveryOptions: RecoveryOption[];
  securityQuestions?: SecurityQuestion[];
  lastVerified?: string;
  verificationExpiry?: number;
};

const STORAGE_KEYS = {
  VERIFICATION_STATE: '@verification_state',
  RECOVERY_CODES: '@recovery_codes',
  SECURITY_QUESTIONS: '@security_questions',
};

export const generateRecoveryCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = Math.random().toString(36).substring(2, 11).toUpperCase();
    codes.push(code.match(/.{1,4}/g)?.join('-') || code);
  }
  return codes;
};

export const saveVerificationState = async (state: VerificationState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.VERIFICATION_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving verification state:', error);
    throw error;
  }
}; 