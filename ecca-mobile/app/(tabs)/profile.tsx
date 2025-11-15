import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { logout, getCurrentUser } from '../../lib/auth';
import * as SecureStore from 'expo-secure-store';

type TextSize = 'small' | 'medium' | 'large' | 'extra-large';
type Theme = 'light' | 'dark';
type Units = 'imperial' | 'metric';

interface Settings {
  textSize: TextSize;
  theme: Theme;
  units: Units;
  notifications: boolean;
  activityReminders: boolean;
  medicationReminders: boolean;
}
import { 
  isBiometricSupported, 
  isBiometricEnrolled, 
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
  authenticateWithBiometric,
  getBiometricType
} from '../../lib/biometrics';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<Settings>({
    textSize: 'medium',
    theme: 'light',
    units: 'imperial',
    notifications: true,
    activityReminders: true,
    medicationReminders: true,
  });
  
  const [emergencyContactModalVisible, setEmergencyContactModalVisible] = useState(false);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [hasEmergencyContact, setHasEmergencyContact] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  useEffect(() => {
    loadUser();
    loadSettings();
    loadEmergencyContact();
    checkBiometrics();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await SecureStore.getItemAsync('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await SecureStore.setItemAsync('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const loadEmergencyContact = async () => {
    try {
      const contact = await SecureStore.getItemAsync('emergency_contact');
      if (contact) {
        const parsed = JSON.parse(contact);
        setEmergencyContactName(parsed.name);
        setEmergencyContactPhone(parsed.phone);
        setHasEmergencyContact(true);
      }
    } catch (error) {
      console.error('Error loading emergency contact:', error);
    }
  };

  const saveEmergencyContact = async () => {
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }

    try {
      const contact = { name: emergencyContactName, phone: emergencyContactPhone };
      await SecureStore.setItemAsync('emergency_contact', JSON.stringify(contact));
      setHasEmergencyContact(true);
      setEmergencyContactModalVisible(false);
      Alert.alert('Success', 'Emergency contact saved');
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      Alert.alert('Error', 'Failed to save emergency contact');
    }
  };

  const deleteEmergencyContact = () => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove your emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('emergency_contact');
              setEmergencyContactName('');
              setEmergencyContactPhone('');
              setHasEmergencyContact(false);
              Alert.alert('Success', 'Emergency contact removed');
            } catch (error) {
              console.error('Error deleting emergency contact:', error);
            }
          },
        },
      ]
    );
  };

  const updateTextSize = (size: TextSize) => {
    saveSettings({ ...settings, textSize: size });
  };

  const updateTheme = (theme: Theme) => {
    saveSettings({ ...settings, theme });
    Alert.alert('Info', 'Theme changes will be applied in the next update');
  };

  const updateUnits = (units: Units) => {
    saveSettings({ ...settings, units });
  };

  const toggleNotifications = (value: boolean) => {
    saveSettings({ ...settings, notifications: value });
  };

  const toggleActivityReminders = (value: boolean) => {
    saveSettings({ ...settings, activityReminders: value });
  };

  const toggleMedicationReminders = (value: boolean) => {
    saveSettings({ ...settings, medicationReminders: value });
  };

  const showHelp = () => {
    Alert.alert(
      'Help & Support',
      'For assistance, please contact support@eccahealth.com or call 1-800-ECCA-HELP',
      [{ text: 'OK' }]
    );
  };
  const checkBiometrics = async () => {
    const supported = await isBiometricSupported();
    const enrolled = await isBiometricEnrolled();
    const enabled = await isBiometricEnabled();
    const type = await getBiometricType();
    
    setBiometricSupported(supported && enrolled);
    setBiometricEnabled(enabled);
    setBiometricType(type);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Enabling - require authentication first
      const authenticated = await authenticateWithBiometric();
      if (authenticated) {
        await enableBiometric();
        setBiometricEnabled(true);
        Alert.alert('Success', `${biometricType} login enabled!`);
      } else {
        Alert.alert('Failed', 'Authentication required to enable biometric login');
      }
    } else {
      // Disabling
      Alert.alert(
        'Disable Biometric Login',
        `Are you sure you want to disable ${biometricType} login?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await disableBiometric();
              setBiometricEnabled(false);
            },
          },
        ]
      );
    }
  };

const handleLogout = () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // Just replace with login - simple and clean
          router.replace('/login');
        },
      },
    ]
  );
};

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.mainTitle}>Settings</Text>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Name</Text>
                <Text style={styles.cardValue}>{user?.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Email</Text>
                <Text style={styles.cardValue}>{user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          
          {hasEmergencyContact ? (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Ionicons name="call-outline" size={20} color="#FF3B30" />
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Contact Name</Text>
                  <Text style={styles.cardValue}>{emergencyContactName}</Text>
                  <Text style={styles.cardSubvalue}>{emergencyContactPhone}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => setEmergencyContactModalVisible(true)}>
                    <Ionicons name="pencil-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={deleteEmergencyContact} style={{ marginLeft: 15 }}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setEmergencyContactModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.addButtonText}>Add Emergency Contact</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          
          <View style={styles.card}>
            <Text style={styles.settingLabel}>Text Size</Text>
            <View style={styles.optionsRow}>
              {(['small', 'medium', 'large', 'extra-large'] as TextSize[]).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    settings.textSize === size && styles.optionButtonActive,
                  ]}
                  onPress={() => updateTextSize(size)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.textSize === size && styles.optionTextActive,
                    ]}
                  >
                    {size === 'extra-large' ? 'XL' : size.charAt(0).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionButtonWide,
                  settings.theme === 'light' && styles.optionButtonActive,
                ]}
                onPress={() => updateTheme('light')}
              >
                <Ionicons 
                  name="sunny-outline" 
                  size={20} 
                  color={settings.theme === 'light' ? '#fff' : '#666'} 
                />
                <Text
                  style={[
                    styles.optionTextWide,
                    settings.theme === 'light' && styles.optionTextActive,
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButtonWide,
                  settings.theme === 'dark' && styles.optionButtonActive,
                ]}
                onPress={() => updateTheme('dark')}
              >
                <Ionicons 
                  name="moon-outline" 
                  size={20} 
                  color={settings.theme === 'dark' ? '#fff' : '#666'} 
                />
                <Text
                  style={[
                    styles.optionTextWide,
                    settings.theme === 'dark' && styles.optionTextActive,
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.card}>
            <Text style={styles.settingLabel}>Units</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionButtonWide,
                  settings.units === 'imperial' && styles.optionButtonActive,
                ]}
                onPress={() => updateUnits('imperial')}
              >
                <Text
                  style={[
                    styles.optionTextWide,
                    settings.units === 'imperial' && styles.optionTextActive,
                  ]}
                >
                  Imperial (mi, lb)
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButtonWide,
                  settings.units === 'metric' && styles.optionButtonActive,
                ]}
                onPress={() => updateUnits('metric')}
              >
                <Text
                  style={[
                    styles.optionTextWide,
                    settings.units === 'metric' && styles.optionTextActive,
                  ]}
                >
                  Metric (km, kg)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Ionicons name="notifications-outline" size={20} color="#666" />
                <Text style={styles.switchText}>All Notifications</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Ionicons name="fitness-outline" size={20} color="#666" />
                <Text style={styles.switchText}>Activity Reminders</Text>
              </View>
              <Switch
                value={settings.activityReminders}
                onValueChange={toggleActivityReminders}
                disabled={!settings.notifications}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Ionicons name="medkit-outline" size={20} color="#666" />
                <Text style={styles.switchText}>Medication Reminders</Text>
              </View>
              <Switch
                value={settings.medicationReminders}
                onValueChange={toggleMedicationReminders}
                disabled={!settings.notifications}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.actionCard} onPress={showHelp}>
            <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.actionCardText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="document-text-outline" size={24} color="#007AFF" />
            <Text style={styles.actionCardText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.actionCardText}>About</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      {biometricSupported && (
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.label}>{biometricType} Login</Text>
              <Text style={styles.subtitle}>
                Use {biometricType.toLowerCase()} to login quickly
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      {/* Emergency Contact Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={emergencyContactModalVisible}
        onRequestClose={() => setEmergencyContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {hasEmergencyContact ? 'Edit' : 'Add'} Emergency Contact
            </Text>

            <Text style={styles.label}>Contact Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., John Doe"
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., (555) 123-4567"
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEmergencyContactModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={saveEmergencyContact}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
    fontWeight: '500',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardSubvalue: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 10,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
  },
  optionButtonWide: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    gap: 6,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  optionTextWide: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchText: {
    fontSize: 15,
    color: '#333',
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionCardText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});