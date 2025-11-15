import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

// Check if device supports biometrics
export const isBiometricSupported = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return compatible;
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return false;
  }
};

// Check if biometrics are enrolled (user has fingerprints/face registered)
export const isBiometricEnrolled = async (): Promise<boolean> => {
  try {
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error('Error checking biometric enrollment:', error);
    return false;
  }
};

// Check if user has enabled biometric login in app
export const isBiometricEnabled = async (): Promise<boolean> => {
  const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return enabled === 'true';
};

// Enable biometric login for this user
export const enableBiometric = async (): Promise<void> => {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
};

// Disable biometric login
export const disableBiometric = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
};

// Authenticate with biometrics
export const authenticateWithBiometric = async (): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access ECCA',
      fallbackLabel: 'Use password instead',
      cancelLabel: 'Cancel',
    });

    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};

// Get available biometric types (for display purposes)
export const getBiometricType = async (): Promise<string> => {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  
  return 'Biometric';
};

const LAST_EMAIL_KEY = 'last_logged_in_email';

// Store the last logged-in email for biometric re-authentication
export const storeLastEmail = async (email: string): Promise<void> => {
  await SecureStore.setItemAsync(LAST_EMAIL_KEY, email);
};

// Get the last logged-in email
export const getLastEmail = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(LAST_EMAIL_KEY);
};

// Clear the last email on logout
export const clearLastEmail = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(LAST_EMAIL_KEY);
};

const BIOMETRIC_USER_ID_KEY = 'biometric_user_id';

// Store user ID for biometric re-authentication
export const storeBiometricUserId = async (userId: number): Promise<void> => {
  await SecureStore.setItemAsync(BIOMETRIC_USER_ID_KEY, userId.toString());
};

// Get stored user ID
export const getBiometricUserId = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(BIOMETRIC_USER_ID_KEY);
};

// Clear biometric user ID
export const clearBiometricUserId = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(BIOMETRIC_USER_ID_KEY);
};