import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';

export type TextSize = 'small' | 'medium' | 'large' | 'extra-large';
export type Theme = 'light' | 'dark';
export type Units = 'imperial' | 'metric';

export interface AppSettings {
  textSize: TextSize;
  theme: Theme;
  units: Units;
  notifications: boolean;
  activityReminders: boolean;
  medicationReminders: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  textSize: 'medium',
  theme: 'light',
  units: 'imperial',
  notifications: true,
  activityReminders: true,
  medicationReminders: true,
};

// Keys for SecureStore
const SETTINGS_KEY = 'app_settings';
const EMERGENCY_CONTACT_KEY = 'emergency_contact';

// ==================== Settings Functions ====================

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const saved = await SecureStore.getItemAsync(SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: AppSettings): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// ==================== Emergency Contact Functions ====================

export const getEmergencyContact = async (): Promise<EmergencyContact | null> => {
  try {
    const saved = await SecureStore.getItemAsync(EMERGENCY_CONTACT_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.error('Error loading emergency contact:', error);
    return null;
  }
};

export const saveEmergencyContact = async (contact: EmergencyContact): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(EMERGENCY_CONTACT_KEY, JSON.stringify(contact));
    return true;
  } catch (error) {
    console.error('Error saving emergency contact:', error);
    return false;
  }
};

export const deleteEmergencyContact = async (): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(EMERGENCY_CONTACT_KEY);
    return true;
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    return false;
  }
};

// ==================== React Hook ====================

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await getSettings();
    setSettings(loaded);
    setLoading(false);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    const success = await saveSettings(updated);
    if (success) {
      setSettings(updated);
    }
    return success;
  };

  return { settings, loading, updateSettings, refreshSettings: loadSettings };
};

// ==================== Unit Conversion Functions ====================

/**
 * Convert distance based on user's unit preference
 * @param miles - Distance in miles
 * @param units - User's preferred units
 * @returns Formatted distance string with unit
 */
export const formatDistance = (miles: number | null | undefined, units: Units): string => {
  if (!miles) return '0 mi';
  
  if (units === 'metric') {
    const km = miles * 1.60934;
    return `${km.toFixed(2)} km`;
  }
  
  return `${miles.toFixed(2)} mi`;
};

/**
 * Convert weight based on user's unit preference
 * @param pounds - Weight in pounds
 * @param units - User's preferred units
 * @returns Formatted weight string with unit
 */
export const formatWeight = (pounds: number | null | undefined, units: Units): string => {
  if (!pounds) return '0 lb';
  
  if (units === 'metric') {
    const kg = pounds * 0.453592;
    return `${kg.toFixed(1)} kg`;
  }
  
  return `${pounds.toFixed(1)} lb`;
};

/**
 * Get unit label for distance
 * @param units - User's preferred units
 * @returns Unit label (mi or km)
 */
export const getDistanceUnit = (units: Units): string => {
  return units === 'metric' ? 'km' : 'mi';
};

/**
 * Get unit label for weight
 * @param units - User's preferred units
 * @returns Unit label (lb or kg)
 */
export const getWeightUnit = (units: Units): string => {
  return units === 'metric' ? 'kg' : 'lb';
};

// ==================== Text Size Functions ====================

/**
 * Get font size multiplier based on text size setting
 * @param textSize - User's text size preference
 * @returns Multiplier for font sizes
 */
export const getTextSizeMultiplier = (textSize: TextSize): number => {
  const multipliers: Record<TextSize, number> = {
    small: 0.9,
    medium: 1.0,
    large: 1.15,
    'extra-large': 1.3,
  };
  return multipliers[textSize];
};

/**
 * Scale a font size based on user's text size preference
 * @param baseSize - Base font size
 * @param textSize - User's text size preference
 * @returns Scaled font size
 */
export const scaleFont = (baseSize: number, textSize: TextSize): number => {
  return Math.round(baseSize * getTextSizeMultiplier(textSize));
};

/**
 * Get scaled font sizes for common text elements
 * @param textSize - User's text size preference
 * @returns Object with scaled font sizes
 */
export const getScaledFonts = (textSize: TextSize) => {
  const multiplier = getTextSizeMultiplier(textSize);
  
  return {
    title: Math.round(24 * multiplier),
    sectionTitle: Math.round(20 * multiplier),
    body: Math.round(16 * multiplier),
    label: Math.round(14 * multiplier),
    caption: Math.round(12 * multiplier),
    large: Math.round(18 * multiplier),
  };
};

// ==================== Theme Functions ====================

/**
 * Get color scheme based on theme
 * @param theme - User's theme preference
 * @returns Object with theme colors
 */
export const getThemeColors = (theme: Theme) => {
  if (theme === 'dark') {
    return {
      background: '#1C1C1E',
      cardBackground: '#2C2C2E',
      text: '#FFFFFF',
      secondaryText: '#AEAEB2',
      border: '#38383A',
      primary: '#0A84FF',
      success: '#32D74B',
      warning: '#FF9F0A',
      error: '#FF453A',
    };
  }
  
  // Light theme (default)
  return {
    background: '#F5F5F5',
    cardBackground: '#FFFFFF',
    text: '#000000',
    secondaryText: '#666666',
    border: '#E5E5EA',
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  };
};

// ==================== Notification Helper ====================

/**
 * Check if a specific notification type should be shown
 * @param settings - User's settings
 * @param type - Type of notification to check
 * @returns Whether the notification should be shown
 */
export const shouldShowNotification = (
  settings: AppSettings,
  type: 'activity' | 'medication'
): boolean => {
  if (!settings.notifications) return false;
  
  if (type === 'activity') {
    return settings.activityReminders;
  }
  
  if (type === 'medication') {
    return settings.medicationReminders;
  }
  
  return false;
};

// ==================== Emergency Contact Helpers ====================

/**
 * Format phone number for display
 * @param phone - Raw phone number
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phone;
};

/**
 * Check if emergency contact is set up
 * @returns Whether emergency contact exists
 */
export const hasEmergencyContact = async (): Promise<boolean> => {
  const contact = await getEmergencyContact();
  return contact !== null;
};