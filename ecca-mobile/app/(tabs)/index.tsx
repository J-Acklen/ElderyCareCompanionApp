import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { checkAuthStatus, getCurrentUser } from '../../lib/auth';
import { getHealthRecords, HealthRecord } from '../../lib/healthRecords';
import { useFocusEffect } from '@react-navigation/native';
import { getFitnessActivities, FitnessActivity } from '../../lib/fitnessActivities';

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [fitnessActivities, setFitnessActivities] = useState<FitnessActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  // Re-check auth when screen comes into focus
  useFocusEffect(() => {
    checkAuthStatus();
  });

  const loadAllData = async () => {
    const user = await getCurrentUser();
    if (user) {
      setUserName(user.name);
      const health = await getHealthRecords(user.id);
      const fitness = await getFitnessActivities(user.id);
      setHealthRecords(health.slice(0, 3)); // Get last 3
      setFitnessActivities(fitness.slice(0, 3)); // Get last 3
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const getMetricLabel = (metric: string) => {
    const labels: { [key: string]: string } = {
      blood_pressure: 'Blood Pressure',
      heart_rate: 'Heart Rate',
      temperature: 'Temperature',
      glucose: 'Blood Glucose',
      weight: 'Weight',
    };
    return labels[metric] || metric;
  };

  const getMetricUnit = (metric: string) => {
    const units: { [key: string]: string } = {
      blood_pressure: 'mmHg',
      heart_rate: 'bpm',
      temperature: '°F',
      glucose: 'mg/dL',
      weight: 'lbs',
    };
    return units[metric] || '';
  };

  const getActivityLabel = (activity: string) => {
    const labels: { [key: string]: string } = {
      walking: 'Walking',
      running: 'Running',
      cycling: 'Cycling',
      swimming: 'Swimming',
      yoga: 'Yoga',
      strength: 'Strength Training',
    };
    return labels[activity] || activity;
  };

  const formatDate = (dateString: string) => {
  // SQLite returns UTC timestamps, so we need to parse them correctly
  const date = new Date(dateString + 'Z'); // Adding 'Z' tells JS it's UTC
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.greeting}>Welcome back, {userName}!</Text>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="heart" size={24} color="#FF3B30" />
          <Text style={styles.summaryNumber}>{healthRecords.length}</Text>
          <Text style={styles.summaryLabel}>Health Logs</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="fitness" size={24} color="#34C759" />
          <Text style={styles.summaryNumber}>{fitnessActivities.length}</Text>
          <Text style={styles.summaryLabel}>Activities</Text>
        </View>
      </View>

      {/* Recent Health Records */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Health Logs</Text>
          <Ionicons name="heart-outline" size={20} color="#FF3B30" />
        </View>

        {healthRecords.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No health records yet</Text>
            <Text style={styles.emptySubtext}>Tap the Health tab to start logging</Text>
          </View>
        ) : (
          healthRecords.map((record) => (
            <View key={record.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{getMetricLabel(record.type)}</Text>
                <Text style={styles.itemTime}>{formatDate(record.recorded_at || '')}</Text>
              </View>
              <Text style={styles.itemValue}>
                {record.value} {getMetricUnit(record.type)}
              </Text>
              {record.notes && <Text style={styles.itemNotes}>{record.notes}</Text>}
            </View>
          ))
        )}
      </View>

      {/* Recent Fitness Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <Ionicons name="fitness-outline" size={20} color="#34C759" />
        </View>

        {fitnessActivities.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No activities logged yet</Text>
            <Text style={styles.emptySubtext}>Tap the Fitness tab to log activities</Text>
          </View>
        ) : (
          fitnessActivities.map((activity) => (
            <View key={activity.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{getActivityLabel(activity.activity_type)}</Text>
                <Text style={styles.itemTime}>{formatDate(activity.recorded_at || '')}</Text>
              </View>
              <View style={styles.activityStats}>
                {activity.duration && (
                  <Text style={styles.activityStat}>⏱️ {activity.duration} min</Text>
                )}
                {activity.distance && (
                  <Text style={styles.activityStat}>📍 {activity.distance} mi</Text>
                )}
                {activity.calories && (
                  <Text style={styles.activityStat}>🔥 {activity.calories} cal</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Quick Tips */}
      <View style={styles.tipsCard}>
        <Ionicons name="bulb-outline" size={24} color="#FF9500" />
        <Text style={styles.tipsTitle}>Quick Tips</Text>
        <Text style={styles.tipsText}>• Log your health metrics regularly</Text>
        <Text style={styles.tipsText}>• Aim for 30 minutes of activity daily</Text>
        <Text style={styles.tipsText}>• Stay hydrated throughout the day</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginVertical: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemTime: {
    fontSize: 12,
    color: '#999',
  },
  itemValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  itemNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  activityStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityStat: {
    fontSize: 14,
    color: '#666',
  },
  tipsCard: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});