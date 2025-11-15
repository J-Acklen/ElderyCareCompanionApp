// app/(tabs)/index.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { checkAuthStatus, getCurrentUser } from '../../lib/auth';
import { getHealthRecords, HealthRecord } from '../../lib/healthRecords';
import { useFocusEffect } from '@react-navigation/native';
import { getFitnessActivities, FitnessActivity } from '../../lib/fitnessActivities';
import { getCurrentUser } from '../../lib/auth';
import { getFitnessActivities } from '../../lib/fitnessActivities';
import { getHealthRecords } from '../../lib/healthRecords';
import { useSettings, getScaledFonts, formatDistance, formatWeight } from '../../lib/settings';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { settings } = useSettings();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  // Re-check auth when screen comes into focus
  useFocusEffect(() => {
    checkAuthStatus();
  });

  const loadData = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser?.id) {
      setUser(currentUser);
      const activities = await getFitnessActivities(currentUser.id);
      const records = await getHealthRecords(currentUser.id);
      setRecentActivities(activities.slice(0, 3));
      setRecentRecords(records.slice(0, 3));
    }
    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'Z');
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      walking: 'walk',
      running: 'fitness',
      cycling: 'bicycle',
      swimming: 'water',
      yoga: 'body',
      strength: 'barbell',
    };
    return icons[type] || 'fitness';
  };

  const getActivityColor = (type: string) => {
    const colors: { [key: string]: string } = {
      walking: '#34C759',
      running: '#FF3B30',
      cycling: '#007AFF',
      swimming: '#5AC8FA',
      yoga: '#FF9500',
      strength: '#5856D6',
    };
    return colors[type] || '#999';
  };

  const getHealthIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      blood_pressure: 'fitness',
      heart_rate: 'heart',
      temperature: 'thermometer',
      glucose: 'water',
      weight: 'scale',
    };
    return icons[type] || 'medical';
  };

  const fonts = getScaledFonts(settings.textSize);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      paddingTop: 40,
      backgroundColor: colors.primary,
    },
    greeting: {
      fontSize: fonts.large,
      color: '#fff',
      marginBottom: 5,
    },
    userName: {
      fontSize: fonts.title,
      fontWeight: 'bold',
      color: '#fff',
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 20,
      backgroundColor: colors.cardBackground,
      marginHorizontal: 20,
      marginTop: -30,
      borderRadius: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    actionButton: {
      alignItems: 'center',
      flex: 1,
    },
    actionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark ? '#3A3A3C' : '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionText: {
      fontSize: fonts.caption,
      color: colors.text,
      textAlign: 'center',
      fontWeight: '600',
    },
    content: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: fonts.sectionTitle,
      fontWeight: 'bold',
      marginBottom: 15,
      color: colors.text,
    },
    card: {
      backgroundColor: colors.cardBackground,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: fonts.body,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 10,
      flex: 1,
    },
    cardDate: {
      fontSize: fonts.caption,
      color: colors.secondaryText,
    },
    cardContent: {
      fontSize: fonts.label,
      color: colors.secondaryText,
      marginTop: 5,
    },
    emptyState: {
      backgroundColor: colors.cardBackground,
      padding: 30,
      borderRadius: 10,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    emptyIcon: {
      marginBottom: 10,
    },
    emptyText: {
      fontSize: fonts.body,
      color: colors.secondaryText,
      textAlign: 'center',
    },
    viewAllButton: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    viewAllText: {
      fontSize: fonts.label,
      color: colors.primary,
      fontWeight: '600',
    },
  });

  if (loading) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={dynamicStyles.emptyText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.greeting}>{getGreeting()},</Text>
        <Text style={dynamicStyles.userName}>{user?.name || 'User'}</Text>
      </View>

      <View style={dynamicStyles.quickActions}>
        <TouchableOpacity 
          style={dynamicStyles.actionButton}
          onPress={() => router.push('/(tabs)/fitness')}
        >
          <View style={dynamicStyles.actionIcon}>
            <Ionicons name="fitness" size={24} color={colors.primary} />
          </View>
          <Text style={dynamicStyles.actionText}>Log Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={dynamicStyles.actionButton}
          onPress={() => router.push('/(tabs)/health')}
        >
          <View style={dynamicStyles.actionIcon}>
            <Ionicons name="heart" size={24} color="#FF3B30" />
          </View>
          <Text style={dynamicStyles.actionText}>Log Health</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={dynamicStyles.actionButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <View style={dynamicStyles.actionIcon}>
            <Ionicons name="person" size={24} color="#5856D6" />
          </View>
          <Text style={dynamicStyles.actionText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={dynamicStyles.content}>
        <Text style={dynamicStyles.sectionTitle}>Recent Fitness Activities</Text>
        
        {recentActivities.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <Ionicons 
              name="fitness-outline" 
              size={48} 
              color={colors.secondaryText} 
              style={dynamicStyles.emptyIcon}
            />
            <Text style={dynamicStyles.emptyText}>No activities yet.{'\n'}Start tracking your fitness!</Text>
          </View>
        ) : (
          <>
            {recentActivities.map((activity) => (
              <View key={activity.id} style={dynamicStyles.card}>
                <View style={dynamicStyles.cardHeader}>
                  <Ionicons 
                    name={getActivityIcon(activity.activity_type)} 
                    size={20} 
                    color={getActivityColor(activity.activity_type)}
                  />
                  <Text style={dynamicStyles.cardTitle}>
                    {activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)}
                  </Text>
                  <Text style={dynamicStyles.cardDate}>
                    {formatDate(activity.recorded_at)}
                  </Text>
                </View>
                <Text style={dynamicStyles.cardContent}>
                  {activity.duration && `${activity.duration} min`}
                  {activity.distance && ` • ${formatDistance(activity.distance, settings.units)}`}
                  {activity.calories && ` • ${activity.calories} cal`}
                </Text>
              </View>
            ))}
            <TouchableOpacity 
              style={dynamicStyles.viewAllButton}
              onPress={() => router.push('/(tabs)/fitness')}
            >
              <Text style={dynamicStyles.viewAllText}>View All Activities →</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={[dynamicStyles.sectionTitle, { marginTop: 20 }]}>Recent Health Records</Text>
        
        {recentRecords.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <Ionicons 
              name="medical-outline" 
              size={48} 
              color={colors.secondaryText} 
              style={dynamicStyles.emptyIcon}
            />
            <Text style={dynamicStyles.emptyText}>No health records yet.{'\n'}Start logging your health metrics!</Text>
          </View>
        ) : (
          <>
            {recentRecords.map((record) => (
              <View key={record.id} style={dynamicStyles.card}>
                <View style={dynamicStyles.cardHeader}>
                  <Ionicons 
                    name={getHealthIcon(record.type)} 
                    size={20} 
                    color={colors.primary}
                  />
                  <Text style={dynamicStyles.cardTitle}>
                    {record.type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Text>
                  <Text style={dynamicStyles.cardDate}>
                    {formatDate(record.recorded_at)}
                  </Text>
                </View>
                <Text style={dynamicStyles.cardContent}>
                  {record.value}
                  {record.type === 'weight' && ` ${settings.units === 'metric' ? 'kg' : 'lbs'}`}
                  {record.type === 'heart_rate' && ' bpm'}
                  {record.type === 'temperature' && (settings.units === 'metric' ? ' °C' : ' °F')}
                </Text>
              </View>
            ))}
            <TouchableOpacity 
              style={dynamicStyles.viewAllButton}
              onPress={() => router.push('/(tabs)/health')}
            >
              <Text style={dynamicStyles.viewAllText}>View All Records →</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}