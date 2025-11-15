import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { logout, getCurrentUser } from '../../lib/auth';
import { 
  isBiometricSupported, 
  isBiometricEnrolled, 
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
  authenticateWithBiometric,
  getBiometricType
} from '../../lib/biometrics';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  useEffect(() => {
    loadUser();
    checkBiometrics();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
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
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name}</Text>
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

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
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
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});