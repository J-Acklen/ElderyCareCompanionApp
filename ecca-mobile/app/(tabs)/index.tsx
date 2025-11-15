import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../lib/auth';

export default function Dashboard() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setUserName(user.name);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Welcome back, {userName}!</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Summary</Text>
        <Text style={styles.cardText}>Your health metrics will appear here</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <Text style={styles.cardText}>• Log vital signs</Text>
        <Text style={styles.cardText}>• Record exercise</Text>
        <Text style={styles.cardText}>• Update medications</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
});