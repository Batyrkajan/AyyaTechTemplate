import { theme } from "../theme";

// Add password strength types
export type PasswordStrength = {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
};

// Add entropy calculation
const calculateEntropy = (password: string): number => {
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^A-Za-z0-9]/.test(password)) charset += 33;
  return Math.log2(Math.pow(charset, password.length));
};

// Add more password patterns
const patterns = {
  keyboard: /(qwerty|asdfgh|zxcvbn|qazwsx)/i,
  sequential: /(abc|bcd|cde|def|efg|123|234|345|456|321|987)/i,
  repeated: /(.)\1{2,}/,
  common: /(password|admin|user|login|welcome|letmein|trustno1)/i,
  years: /(19\d{2}|20\d{2})/,
  dates: /(\d{1,2}[-.\/]\d{1,2}[-.\/]\d{2,4})/,
  personal: /(birthday|name|user|admin|root|login)/i,
  dictionary: /(password|dragon|monkey|master|football|baseball|abc123)/i,
  keyboard_patterns: /(qwe|asd|zxc|!@#|\$%\^)/i,
  keyboard_rows: /(qwertyuiop|asdfghjkl|zxcvbnm)/i,
  keyboard_columns: /(qazwsx|wsxedc|edcrfv|rfvtgb|tgbyhn|yhnujm|ujmik|ikol|olp)/i,
  leet_speak: /([a-z])*([@4][a4]|[1!][il1]|[0oO][0o]|[$5][s5]|[7+][t7])+([a-z])*/i,
  personal_extended: /(username|firstname|lastname|fullname|surname|nickname|email)/i,
  dates_extended: /(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[0-2])\d{2,4}/,
  phone_numbers: /\d{3}[-.]?\d{3}[-.]?\d{4}/,
  common_extended: /(welcome123|admin123|password123|letmein123|trustno1|secret|shadow)/i,
  dictionary_extended: /(princess|sunshine|butterfly|rainbow|diamond|forever|summer|winter)/i,
  number_sequences: /(12345|54321|11111|22222|33333|44444|55555|66666|77777|88888|99999|00000)/,
};

// Update complexity scoring
const calculateComplexityScore = (password: string): number => {
  let score = calculateBaseScore(password);
  score += calculatePatternScore(password);
  score += calculateEntropyScore(password);
  return normalizeScore(score);
};

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const suggestions: string[] = [];

  // Enhanced length check
  if (password.length >= 16) score += 2;
  else if (password.length >= 12) score += 1;
  else suggestions.push("Use at least 12 characters (16+ recommended)");

  // Character variety with weighted scoring
  if (/[A-Z]/.test(password)) score += 0.7;
  if (/[a-z]/.test(password)) score += 0.7;
  if (/[0-9]/.test(password)) score += 0.7;
  if (/[^A-Za-z0-9]/.test(password)) score += 0.9;

  // Entropy check
  const entropy = calculateEntropy(password);
  if (entropy > 80) score += 1;
  else if (entropy < 50) suggestions.push("Make password more complex");

  // Pattern checks
  Object.entries(patterns).forEach(([type, pattern]) => {
    if (pattern.test(password)) {
      score -= 1;
      suggestions.push(`Avoid ${type.replace(/([A-Z])/g, ' $1').toLowerCase()} patterns`);
    }
  });

  // Context-based suggestions
  if (!/[A-Z]/.test(password)) suggestions.push("Add uppercase letters");
  if (!/[a-z]/.test(password)) suggestions.push("Add lowercase letters");
  if (!/[0-9]/.test(password)) suggestions.push("Add numbers");
  if (!/[^A-Za-z0-9]/.test(password)) suggestions.push("Add special characters");
  if (/^[A-Za-z0-9]+$/.test(password)) suggestions.push("Mix different character types");

  const strengthLevels: PasswordStrength[] = [
    { score: 0, label: "Very Weak", color: theme.colors.accent, suggestions: [] },
    { score: 1, label: "Weak", color: "#ff4444", suggestions: [] },
    { score: 2, label: "Fair", color: "#ffbb33", suggestions: [] },
    { score: 3, label: "Good", color: "#00C851", suggestions: [] },
    { score: 4, label: "Strong", color: "#007E33", suggestions: [] },
  ];

  // Normalize score between 0 and 4
  score = Math.max(0, Math.min(4, score));
  
  const strength = strengthLevels[Math.floor(score)];
  return {
    ...strength,
    score,
    suggestions: suggestions.slice(0, 3),
  };
}; 