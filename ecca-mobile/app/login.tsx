import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { login, loginWithBiometric } from '../lib/auth';
import { 
  isBiometricSupported, 
  isBiometricEnrolled, 
  isBiometricEnabled,
  authenticateWithBiometric,
  getBiometricType,
  getLastEmail
} from '../lib/biometrics';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const supported = await isBiometricSupported();
    const enrolled = await isBiometricEnrolled();
    const enabled = await isBiometricEnabled();
    const lastEmail = await getLastEmail();
    const type = await getBiometricType();
    
    const available = supported && enrolled && enabled && lastEmail !== null;
    setBiometricAvailable(available);
    setBiometricType(type);

    // Auto-trigger biometric if available
    if (available) {
      // Small delay to let UI render first
      setTimeout(() => {
        handleBiometricLogin();
      }, 500);
    }
  };

  const handleBiometricLogin = async () => {
    const authenticated = await authenticateWithBiometric();
    if (authenticated) {
      // Restore user session after biometric auth
      const success = await loginWithBiometric();
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Could not restore session. Please login with password.');
      }
    } else {
      Alert.alert('Authentication Failed', 'Please try again or use your password.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      
      {biometricAvailable && (
        <TouchableOpacity 
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
        >
          <Ionicons 
            name={biometricType === 'Face ID' ? 'scan' : 'finger-print'} 
            size={48} 
            color="#007AFF" 
          />
          <Text style={styles.biometricText}>Login with {biometricType}</Text>
        </TouchableOpacity>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  biometricButton: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  biometricText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
  },
});