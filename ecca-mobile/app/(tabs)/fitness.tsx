import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../../lib/auth';
import { addFitnessActivity, getFitnessActivities, deleteFitnessActivity, FitnessActivity } from '../../lib/fitnessActivities';
import { useSettings, formatDistance, getDistanceUnit, getScaledFonts } from '../../lib/settings';
import { useTheme } from '../../contexts/ThemeContext';
import BarChart from '../../components/BarChart';
import TrendChart from '../../components/TrendChart';

type ActivityType = 'walking' | 'running' | 'cycling' | 'swimming' | 'yoga' | 'strength';

export default function Fitness() {
  const [activities, setActivities] = useState<FitnessActivity[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('walking');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [chartView, setChartView] = useState<'calories' | 'duration'>('calories');
  
  const { settings, loading: settingsLoading } = useSettings();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    loadUserAndActivities();
  }, []);

  const loadUserAndActivities = async () => {
    const user = await getCurrentUser();
    if (user?.id) {
      setUserId(user.id);
      loadActivities(user.id);
    }
  };

  const loadActivities = async (uid: number) => {
    const data = await getFitnessActivities(uid);
    setActivities(data);
  };

  const openModal = (activity: ActivityType) => {
    setSelectedActivity(activity);
    setDuration('');
    setDistance('');
    setCalories('');
    setNotes('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!duration.trim()) {
      Alert.alert('Error', 'Please enter duration');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const success = await addFitnessActivity(
      userId,
      selectedActivity,
      parseInt(duration) || undefined,
      parseFloat(distance) || undefined,
      parseInt(calories) || undefined,
      notes
    );

    if (success) {
      setModalVisible(false);
      loadActivities(userId);
      Alert.alert('Success', 'Activity logged!');
    } else {
      Alert.alert('Error', 'Failed to save activity');
    }
  };

  const handleDelete = (id: number | undefined) => {
    if (!id) return;

    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteFitnessActivity(id);
            if (success && userId) {
              loadActivities(userId);
            }
          },
        },
      ]
    );
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

  const getActivityIcon = (activity: ActivityType): keyof typeof Ionicons.glyphMap => {
    const icons: { [key in ActivityType]: keyof typeof Ionicons.glyphMap } = {
      walking: 'walk',
      running: 'fitness',
      cycling: 'bicycle',
      swimming: 'water',
      yoga: 'body',
      strength: 'barbell',
    };
    return icons[activity];
  };

  const getActivityColor = (activity: string) => {
    const colors: { [key: string]: string } = {
      walking: '#34C759',
      running: '#FF3B30',
      cycling: '#007AFF',
      swimming: '#5AC8FA',
      yoga: '#FF9500',
      strength: '#5856D6',
    };
    return colors[activity] || '#999';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'Z');
    return date.toLocaleString();
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString + 'Z');
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getCaloriesByActivity = () => {
    const activityTypes: ActivityType[] = ['walking', 'running', 'cycling', 'swimming', 'yoga', 'strength'];
    
    return activityTypes.map(type => {
      const typeActivities = activities.filter(a => a.activity_type === type);
      const totalCalories = typeActivities.reduce((sum, a) => sum + (a.calories || 0), 0);
      
      return {
        label: getActivityLabel(type),
        value: totalCalories,
        color: getActivityColor(type),
      };
    }).filter(item => item.value > 0);
  };

  const getDurationTrend = () => {
    return activities
      .slice(0, 7)
      .reverse()
      .map(activity => ({
        label: formatShortDate(activity.recorded_at || ''),
        value: activity.duration || 0,
      }));
  };

  const fonts = getScaledFonts(settings.textSize);
  const distanceUnit = getDistanceUnit(settings.units);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: fonts.title,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colors.text,
    },
    activityButton: {
      width: '48%',
      backgroundColor: colors.cardBackground,
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    activityText: {
      marginTop: 10,
      fontSize: fonts.label,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: fonts.sectionTitle,
      fontWeight: 'bold',
      marginBottom: 15,
      color: colors.text,
    },
    chartSelectorButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: isDark ? '#3A3A3C' : '#E0E0E0',
      borderRadius: 8,
      alignItems: 'center',
    },
    chartSelectorText: {
      fontSize: fonts.caption,
      color: colors.secondaryText,
      fontWeight: '600',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.secondaryText,
      fontSize: fonts.body,
      marginTop: 20,
    },
    activityCard: {
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
    activityType: {
      fontSize: fonts.large,
      fontWeight: '600',
      color: colors.text,
    },
    statText: {
      fontSize: fonts.label,
      color: colors.secondaryText,
    },
    activityNotes: {
      fontSize: fonts.label,
      color: colors.secondaryText,
      marginBottom: 5,
      fontStyle: 'italic',
    },
    activityDate: {
      fontSize: fonts.caption,
      color: colors.secondaryText,
    },
    modalContent: {
      width: '85%',
      backgroundColor: colors.cardBackground,
      borderRadius: 15,
      padding: 20,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: fonts.sectionTitle,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: colors.text,
    },
    label: {
      fontSize: fonts.label,
      fontWeight: '600',
      marginBottom: 5,
      color: colors.text,
    },
    input: {
      backgroundColor: isDark ? '#3A3A3C' : '#f5f5f5',
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      fontSize: fonts.body,
      color: colors.text,
    },
    cancelButton: {
      backgroundColor: isDark ? '#3A3A3C' : '#f5f5f5',
      marginRight: 10,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: fonts.body,
      fontWeight: '600',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: fonts.body,
      fontWeight: '600',
    },
  });

  if (settingsLoading) {
    return (
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.emptyText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <ScrollView>
        <Text style={dynamicStyles.title}>Log Fitness Activity</Text>

        <View style={styles.activitiesGrid}>
          <TouchableOpacity style={dynamicStyles.activityButton} onPress={() => openModal('walking')}>
            <Ionicons name="walk" size={32} color="#34C759" />
            <Text style={dynamicStyles.activityText}>Walking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.activityButton} onPress={() => openModal('running')}>
            <Ionicons name="fitness" size={32} color="#FF3B30" />
            <Text style={dynamicStyles.activityText}>Running</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.activityButton} onPress={() => openModal('cycling')}>
            <Ionicons name="bicycle" size={32} color="#007AFF" />
            <Text style={dynamicStyles.activityText}>Cycling</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.activityButton} onPress={() => openModal('swimming')}>
            <Ionicons name="water" size={32} color="#5AC8FA" />
            <Text style={dynamicStyles.activityText}>Swimming</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.activityButton} onPress={() => openModal('yoga')}>
            <Ionicons name="body" size={32} color="#FF9500" />
            <Text style={dynamicStyles.activityText}>Yoga</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.activityButton} onPress={() => openModal('strength')}>
            <Ionicons name="barbell" size={32} color="#5856D6" />
            <Text style={dynamicStyles.activityText}>Strength</Text>
          </TouchableOpacity>
        </View>

        <Text style={dynamicStyles.sectionTitle}>Activity Stats</Text>
        
        <View style={styles.chartSelector}>
          <TouchableOpacity
            style={[dynamicStyles.chartSelectorButton, chartView === 'calories' && styles.chartSelectorButtonActive]}
            onPress={() => setChartView('calories')}
          >
            <Text style={[dynamicStyles.chartSelectorText, chartView === 'calories' && styles.chartSelectorTextActive]}>
              Calories by Activity
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.chartSelectorButton, chartView === 'duration' && styles.chartSelectorButtonActive]}
            onPress={() => setChartView('duration')}
          >
            <Text style={[dynamicStyles.chartSelectorText, chartView === 'duration' && styles.chartSelectorTextActive]}>
              Duration Trend
            </Text>
          </TouchableOpacity>
        </View>

        {chartView === 'calories' ? (
          <BarChart data={getCaloriesByActivity()} height={200} />
        ) : (
          <TrendChart data={getDurationTrend()} color="#34C759" unit=" min" height={180} />
        )}

        <Text style={dynamicStyles.sectionTitle}>Recent Activities</Text>

        {activities.length === 0 ? (
          <Text style={dynamicStyles.emptyText}>No activities logged yet. Get moving!</Text>
        ) : (
          activities.map((activity) => (
            <View key={activity.id} style={dynamicStyles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityTitleRow}>
                  <Ionicons 
                    name={getActivityIcon(activity.activity_type as ActivityType)} 
                    size={24} 
                    color={getActivityColor(activity.activity_type)}
                  />
                  <Text style={dynamicStyles.activityType}>{getActivityLabel(activity.activity_type)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(activity.id)}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>

              <View style={styles.activityStats}>
                {activity.duration && (
                  <View style={styles.stat}>
                    <Ionicons name="time-outline" size={16} color={colors.secondaryText} />
                    <Text style={dynamicStyles.statText}>{activity.duration} min</Text>
                  </View>
                )}
                {activity.distance && (
                  <View style={styles.stat}>
                    <Ionicons name="navigate-outline" size={16} color={colors.secondaryText} />
                    <Text style={dynamicStyles.statText}>
                      {formatDistance(activity.distance, settings.units)}
                    </Text>
                  </View>
                )}
                {activity.calories && (
                  <View style={styles.stat}>
                    <Ionicons name="flame-outline" size={16} color={colors.secondaryText} />
                    <Text style={dynamicStyles.statText}>{activity.calories} cal</Text>
                  </View>
                )}
              </View>

              {activity.notes ? <Text style={dynamicStyles.activityNotes}>{activity.notes}</Text> : null}
              <Text style={dynamicStyles.activityDate}>{formatDate(activity.recorded_at || '')}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>Log {getActivityLabel(selectedActivity)}</Text>

            <Text style={dynamicStyles.label}>Duration (minutes) *</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="e.g., 30"
              placeholderTextColor={colors.secondaryText}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />

            <Text style={dynamicStyles.label}>Distance ({distanceUnit})</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder={settings.units === 'metric' ? 'e.g., 4.0' : 'e.g., 2.5'}
              placeholderTextColor={colors.secondaryText}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
            />

            <Text style={dynamicStyles.label}>Calories Burned</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="e.g., 150"
              placeholderTextColor={colors.secondaryText}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />

            <Text style={dynamicStyles.label}>Notes (Optional)</Text>
            <TextInput
              style={[dynamicStyles.input, styles.textArea]}
              placeholder="How did you feel?"
              placeholderTextColor={colors.secondaryText}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, dynamicStyles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={dynamicStyles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  chartSelector: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  chartSelectorButtonActive: {
    backgroundColor: '#34C759',
  },
  chartSelectorTextActive: {
    color: '#fff',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  saveButton: {
    backgroundColor: '#007AFF',
  },
});