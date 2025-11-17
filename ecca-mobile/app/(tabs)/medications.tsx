import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../../lib/auth';
import {
  addMedication,
  getMedications,
  deactivateMedication,
  logMedicationTaken,
  getMedicationLogs,
  getTodaysMedicationLogs,
  Medication,
  MedicationLog,
} from '../../lib/medications';
import { runMigrations } from '../../lib/migrations';

export default function Medications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todaysLogs, setTodaysLogs] = useState<MedicationLog[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [medicationHistory, setMedicationHistory] = useState<MedicationLog[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    times: '',
    notes: '',
  });

  const frequencyOptions = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed'];

  useEffect(() => {
    loadUserAndMedications();
  }, []);

  const loadUserAndMedications = async () => {
  // Run migrations first to ensure tables exist
  await runMigrations();
  
  const user = await getCurrentUser();
  if (user?.id) {
    setUserId(user.id);
    loadMedications(user.id);
    loadTodaysLogs(user.id);
  }
};

  const loadMedications = async (uid: number) => {
    const data = await getMedications(uid);
    setMedications(data);
  };

  const loadTodaysLogs = async (uid: number) => {
    const logs = await getTodaysMedicationLogs(uid);
    setTodaysLogs(logs);
  };

  const handleAddMedication = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (!newMed.name.trim() || !newMed.dosage.trim()) {
      Alert.alert('Error', 'Please enter medication name and dosage');
      return;
    }

    const success = await addMedication(
      userId,
      newMed.name,
      newMed.dosage,
      newMed.frequency,
      newMed.times,
      newMed.notes
    );

    if (success) {
      setModalVisible(false);
      loadMedications(userId);
      setNewMed({ name: '', dosage: '', frequency: 'Daily', times: '', notes: '' });
      Alert.alert('Success', 'Medication added!');
    } else {
      Alert.alert('Error', 'Failed to add medication');
    }
  };

  const handleDeleteMedication = (medication: Medication) => {
    Alert.alert(
      'Remove Medication',
      `Remove ${medication.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (medication.id) {
              const success = await deactivateMedication(medication.id);
              if (success && userId) {
                loadMedications(userId);
              }
            }
          },
        },
      ]
    );
  };

  const handleMarkTaken = async (medication: Medication) => {
    if (!userId || !medication.id) return;

    const success = await logMedicationTaken(medication.id, userId);
    if (success) {
      loadTodaysLogs(userId);
      Alert.alert('Logged', `${medication.name} marked as taken`);
    }
  };

  const showHistory = async (medication: Medication) => {
    if (!medication.id) return;
    
    const history = await getMedicationLogs(medication.id);
    setMedicationHistory(history);
    setSelectedMedication(medication);
    setHistoryModal(true);
  };

  const wasTakenToday = (medicationId: number) => {
    return todaysLogs.some(log => log.medication_id === medicationId);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString + 'Z');
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>My Medications</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No medications added yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first medication</Text>
          </View>
        ) : (
          medications.map((med) => (
            <View key={med.id} style={styles.medicationCard}>
              <View style={styles.medHeader}>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                  <Text style={styles.medFrequency}>{med.frequency}</Text>
                  {med.times && <Text style={styles.medTimes}>Times: {med.times}</Text>}
                  {med.notes && <Text style={styles.medNotes}>{med.notes}</Text>}
                </View>
                
                <View style={styles.medActions}>
                  {wasTakenToday(med.id!) ? (
                    <View style={styles.takenBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                      <Text style={styles.takenText}>Taken</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.markTakenButton}
                      onPress={() => handleMarkTaken(med)}
                    >
                      <Text style={styles.markTakenText}>Mark Taken</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.medFooter}>
                <TouchableOpacity onPress={() => showHistory(med)} style={styles.footerButton}>
                  <Ionicons name="time-outline" size={18} color="#007AFF" />
                  <Text style={styles.footerButtonText}>History</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDeleteMedication(med)} style={styles.footerButton}>
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  <Text style={[styles.footerButtonText, { color: '#FF3B30' }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

    {/* Add Medication Modal */}
    <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
            {/* Title stays OUTSIDE ScrollView */}
            <Text style={styles.modalTitle}>Add Medication</Text>
            
            {/* ScrollView wraps ONLY the input fields */}
            <ScrollView 
                style={styles.modalScrollView}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.label}>Medication Name *</Text>
                <TextInput
                style={styles.input}
                placeholder="e.g., Aspirin"
                value={newMed.name}
                onChangeText={(text) => setNewMed({ ...newMed, name: text })}
                />

                <Text style={styles.label}>Dosage *</Text>
                <TextInput
                style={styles.input}
                placeholder="e.g., 10mg"
                value={newMed.dosage}
                onChangeText={(text) => setNewMed({ ...newMed, dosage: text })}
                />

                <Text style={styles.label}>Frequency</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.frequencyScroll}>
                {frequencyOptions.map((freq) => (
                    <TouchableOpacity
                    key={freq}
                    style={[
                        styles.frequencyButton,
                        newMed.frequency === freq && styles.frequencyButtonActive,
                    ]}
                    onPress={() => setNewMed({ ...newMed, frequency: freq })}
                    >
                    <Text
                        style={[
                        styles.frequencyButtonText,
                        newMed.frequency === freq && styles.frequencyButtonTextActive,
                        ]}
                    >
                        {freq}
                    </Text>
                    </TouchableOpacity>
                ))}
                </ScrollView>

                <Text style={styles.label}>Times (Optional)</Text>
                <TextInput
                style={styles.input}
                placeholder="e.g., 8:00 AM, 8:00 PM"
                value={newMed.times}
                onChangeText={(text) => setNewMed({ ...newMed, times: text })}
                />

                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Special instructions..."
                value={newMed.notes}
                onChangeText={(text) => setNewMed({ ...newMed, notes: text })}
                multiline
                numberOfLines={3}
                />
            </ScrollView>
            {/* End of ScrollView */}

            {/* Buttons stay OUTSIDE ScrollView, at the bottom */}
            <View style={styles.modalButtons}>
                <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                    setModalVisible(false);
                    setNewMed({ name: '', dosage: '', frequency: 'Daily', times: '', notes: '' });
                }}
                >
                <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleAddMedication}>
                <Text style={styles.saveButtonText}>Add</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
    </Modal>

      {/* History Modal */}
      <Modal visible={historyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedMedication?.name} History
            </Text>

            <ScrollView style={styles.historyList}>
              {medicationHistory.length === 0 ? (
                <Text style={styles.emptyText}>No history yet</Text>
              ) : (
                medicationHistory.map((log) => (
                  <View key={log.id} style={styles.historyItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                    <Text style={styles.historyText}>{formatDateTime(log.taken_at || '')}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setHistoryModal(false)}
            >
              <Text style={styles.saveButtonText}>Close</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  medicationCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  medDosage: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 3,
  },
  medFrequency: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  medTimes: {
    fontSize: 13,
    color: '#888',
    marginBottom: 3,
  },
  medNotes: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
  },
  medActions: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  takenBadge: {
    alignItems: 'center',
  },
  takenText: {
    fontSize: 11,
    color: '#34C759',
    fontWeight: '600',
    marginTop: 2,
  },
  markTakenButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  markTakenText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  medFooter: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 15,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
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
  frequencyScroll: {
    marginBottom: 15,
  },
  frequencyButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    marginRight: 10,
  },
  frequencyButtonActive: {
    backgroundColor: '#007AFF',
  },
  frequencyButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  frequencyButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    marginTop: 15,
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
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
  },
  modalScrollView: {
    maxHeight: '65%',
  },
});