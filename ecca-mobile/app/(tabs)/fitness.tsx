import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../../lib/auth';
import { addFitnessActivity, getFitnessActivities, deleteFitnessActivity, FitnessActivity } from '../../lib/fitnessActivities';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Log Fitness Activity</Text>

        <View style={styles.activitiesGrid}>
          <TouchableOpacity style={styles.activityButton} onPress={() => openModal('walking')}>
            <Ionicons name="walk" size={32} color="#34C759" />
            <Text style={styles.activityText}>Walking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityButton} onPress={() => openModal('running')}>
            <Ionicons name="fitness" size={32} color="#FF3B30" />
            <Text style={styles.activityText}>Running</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityButton} onPress={() => openModal('cycling')}>
            <Ionicons name="bicycle" size={32} color="#007AFF" />
            <Text style={styles.activityText}>Cycling</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityButton} onPress={() => openModal('swimming')}>
            <Ionicons name="water" size={32} color="#5AC8FA" />
            <Text style={styles.activityText}>Swimming</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityButton} onPress={() => openModal('yoga')}>
            <Ionicons name="body" size={32} color="#FF9500" />
            <Text style={styles.activityText}>Yoga</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityButton} onPress={() => openModal('strength')}>
            <Ionicons name="barbell" size={32} color="#5856D6" />
            <Text style={styles.activityText}>Strength</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Activities</Text>

        {activities.length === 0 ? (
          <Text style={styles.emptyText}>No activities logged yet. Get moving!</Text>
        ) : (
          activities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityTitleRow}>
                  <Ionicons 
                    name={getActivityIcon(activity.activity_type as ActivityType)} 
                    size={24} 
                    color="#007AFF" 
                  />
                  <Text style={styles.activityType}>{getActivityLabel(activity.activity_type)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(activity.id)}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>

              <View style={styles.activityStats}>
                {activity.duration && (
                  <View style={styles.stat}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.statText}>{activity.duration} min</Text>
                  </View>
                )}
                {activity.distance && (
                  <View style={styles.stat}>
                    <Ionicons name="navigate-outline" size={16} color="#666" />
                    <Text style={styles.statText}>{activity.distance} mi</Text>
                  </View>
                )}
                {activity.calories && (
                  <View style={styles.stat}>
                    <Ionicons name="flame-outline" size={16} color="#666" />
                    <Text style={styles.statText}>{activity.calories} cal</Text>
                  </View>
                )}
              </View>

              {activity.notes ? <Text style={styles.activityNotes}>{activity.notes}</Text> : null}
              <Text style={styles.activityDate}>{formatDate(activity.recorded_at || '')}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal for adding fitness activity */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log {getActivityLabel(selectedActivity)}</Text>

            <Text style={styles.label}>Duration (minutes) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 30"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Distance (miles)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2.5"
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Calories Burned</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="How did you feel?"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  activityButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  activityCard: {
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
  activityType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
  statText: {
    fontSize: 14,
    color: '#666',
  },
  activityNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
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
    maxHeight: '80%',
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