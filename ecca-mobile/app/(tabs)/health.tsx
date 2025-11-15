import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../../lib/auth';
import { addHealthRecord, getHealthRecords, deleteHealthRecord, HealthRecord } from '../../lib/healthRecords';
import TrendChart from '../../components/TrendChart';

type HealthMetric = 'blood_pressure' | 'heart_rate' | 'temperature' | 'glucose' | 'weight';

export default function Health() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric>('blood_pressure');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [chartMetric, setChartMetric] = useState<HealthMetric>('heart_rate');

  useEffect(() => {
    loadUserAndRecords();
  }, []);

  const loadUserAndRecords = async () => {
    const user = await getCurrentUser();
    if (user?.id) {
      setUserId(user.id);
      loadRecords(user.id);
    }
  };

  const loadRecords = async (uid: number) => {
    const data = await getHealthRecords(uid);
    setRecords(data);
  };

  const openModal = (metric: HealthMetric) => {
    setSelectedMetric(metric);
    setValue('');
    setNotes('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!value.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const success = await addHealthRecord(userId, selectedMetric, value, notes);
    if (success) {
      setModalVisible(false);
      loadRecords(userId);
      Alert.alert('Success', 'Health record added!');
    } else {
      Alert.alert('Error', 'Failed to save record');
    }
  };

  const handleDelete = (id: number | undefined) => {
    if (!id) return;

    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteHealthRecord(id);
            if (success && userId) {
              loadRecords(userId);
            }
          },
        },
      ]
    );
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'Z');
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Prepare chart data for selected metric
  const getChartData = () => {
    const filteredRecords = records
      .filter(r => r.type === chartMetric)
      .slice(0, 7)
      .reverse();

    return filteredRecords.map(record => ({
      label: formatDate(record.recorded_at || ''),
      value: parseFloat(record.value) || 0,
    }));
  };

  const getMetricColor = (metric: HealthMetric) => {
    const colors: { [key in HealthMetric]: string } = {
      blood_pressure: '#007AFF',
      heart_rate: '#FF3B30',
      temperature: '#FF9500',
      glucose: '#34C759',
      weight: '#5856D6',
    };
    return colors[metric];
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Log Health Metrics</Text>

        <View style={styles.metricsGrid}>
          <TouchableOpacity style={styles.metricButton} onPress={() => openModal('blood_pressure')}>
            <Ionicons name="fitness" size={32} color="#007AFF" />
            <Text style={styles.metricText}>Blood Pressure</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricButton} onPress={() => openModal('heart_rate')}>
            <Ionicons name="heart" size={32} color="#FF3B30" />
            <Text style={styles.metricText}>Heart Rate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricButton} onPress={() => openModal('temperature')}>
            <Ionicons name="thermometer" size={32} color="#FF9500" />
            <Text style={styles.metricText}>Temperature</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricButton} onPress={() => openModal('glucose')}>
            <Ionicons name="water" size={32} color="#34C759" />
            <Text style={styles.metricText}>Blood Glucose</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricButton} onPress={() => openModal('weight')}>
            <Ionicons name="scale" size={32} color="#5856D6" />
            <Text style={styles.metricText}>Weight</Text>
          </TouchableOpacity>
        </View>

        {/* Chart Section */}
        <Text style={styles.sectionTitle}>Trends</Text>
        <View style={styles.chartSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['heart_rate', 'blood_pressure', 'temperature', 'glucose', 'weight'] as HealthMetric[]).map(metric => (
              <TouchableOpacity
                key={metric}
                style={[
                  styles.chartSelectorButton,
                  chartMetric === metric && { backgroundColor: getMetricColor(metric) }
                ]}
                onPress={() => setChartMetric(metric)}
              >
                <Text style={[
                  styles.chartSelectorText,
                  chartMetric === metric && styles.chartSelectorTextActive
                ]}>
                  {getMetricLabel(metric)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TrendChart
          data={getChartData()}
          color={getMetricColor(chartMetric)}
          unit={getMetricUnit(chartMetric)}
          height={180}
        />

        <Text style={styles.sectionTitle}>Recent Records</Text>

        {records.length === 0 ? (
          <Text style={styles.emptyText}>No health records yet. Start logging!</Text>
        ) : (
          records.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordType}>{getMetricLabel(record.type)}</Text>
                <TouchableOpacity onPress={() => handleDelete(record.id)}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
              <Text style={styles.recordValue}>
                {record.value} {getMetricUnit(record.type)}
              </Text>
              {record.notes ? <Text style={styles.recordNotes}>{record.notes}</Text> : null}
              <Text style={styles.recordDate}>{new Date(record.recorded_at + 'Z').toLocaleString()}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal for adding health record */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log {getMetricLabel(selectedMetric)}</Text>

            <Text style={styles.label}>Value ({getMetricUnit(selectedMetric)})</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${getMetricLabel(selectedMetric).toLowerCase()}`}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes..."
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metricButton: {
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
  metricText: {
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
  chartSelector: {
    marginBottom: 10,
  },
  chartSelectorButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    marginRight: 10,
  },
  chartSelectorText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  chartSelectorTextActive: {
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  recordType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  recordNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  recordDate: {
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