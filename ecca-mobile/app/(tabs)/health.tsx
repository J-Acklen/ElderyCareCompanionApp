import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../../lib/auth';
import { addHealthRecord, getHealthRecords, deleteHealthRecord, HealthRecord } from '../../lib/healthRecords';
import { useSettings, formatWeight, getWeightUnit, getScaledFonts } from '../../lib/settings';
import { useTheme } from '../../contexts/ThemeContext';
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

  const { settings, loading: settingsLoading } = useSettings();
  const { colors, isDark } = useTheme();

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
    if (metric === 'temperature') {
      return settings.units === 'metric' ? '°C' : '°F';
    }
    if (metric === 'weight') {
      return getWeightUnit(settings.units);
    }

    const units: { [key: string]: string } = {
      blood_pressure: 'mmHg',
      heart_rate: 'bpm',
      glucose: 'mg/dL',
    };
    return units[metric] || '';
  };

  const getMetricPlaceholder = (metric: string) => {
    const placeholders: { [key: string]: string } = {
      blood_pressure: '120/80',
      heart_rate: '72',
      temperature: settings.units === 'metric' ? '37.0' : '98.6',
      glucose: '100',
      weight: settings.units === 'metric' ? '70.0' : '154',
    };
    return placeholders[metric] || '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'Z');
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatDisplayValue = (metric: string, value: string) => {
    if (metric === 'weight') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return value;
      return formatWeight(numValue, settings.units);
    }

    if (metric === 'temperature') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return value;
      
      if (settings.units === 'metric') {
        const celsius = (numValue - 32) * 5/9;
        return `${celsius.toFixed(1)} °C`;
      }
      return `${numValue} °F`;
    }

    return `${value} ${getMetricUnit(metric)}`;
  };

  const getChartData = () => {
    const filteredRecords = records
      .filter(r => r.type === chartMetric)
      .slice(0, 7)
      .reverse();

    return filteredRecords.map(record => {
      let displayValue = parseFloat(record.value) || 0;
      
      if (chartMetric === 'temperature' && settings.units === 'metric') {
        displayValue = (displayValue - 32) * 5/9;
      }
      
      if (chartMetric === 'weight' && settings.units === 'metric') {
        displayValue = displayValue * 0.453592;
      }

      return {
        label: formatDate(record.recorded_at || ''),
        value: displayValue,
      };
    });
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

  const fonts = getScaledFonts(settings.textSize);

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
    metricButton: {
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
    metricText: {
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
      paddingHorizontal: 15,
      paddingVertical: 8,
      backgroundColor: isDark ? '#3A3A3C' : '#E0E0E0',
      borderRadius: 20,
      marginRight: 10,
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
    recordCard: {
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
    recordType: {
      fontSize: fonts.body,
      fontWeight: '600',
      color: colors.text,
    },
    recordValue: {
      fontSize: fonts.title,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 5,
    },
    recordNotes: {
      fontSize: fonts.label,
      color: colors.secondaryText,
      marginBottom: 5,
    },
    recordDate: {
      fontSize: fonts.caption,
      color: colors.secondaryText,
    },
    modalContent: {
      width: '85%',
      backgroundColor: colors.cardBackground,
      borderRadius: 15,
      padding: 20,
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
        <Text style={dynamicStyles.title}>Log Health Metrics</Text>

        <View style={styles.metricsGrid}>
          <TouchableOpacity style={dynamicStyles.metricButton} onPress={() => openModal('blood_pressure')}>
            <Ionicons name="fitness" size={32} color="#007AFF" />
            <Text style={dynamicStyles.metricText}>Blood Pressure</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.metricButton} onPress={() => openModal('heart_rate')}>
            <Ionicons name="heart" size={32} color="#FF3B30" />
            <Text style={dynamicStyles.metricText}>Heart Rate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.metricButton} onPress={() => openModal('temperature')}>
            <Ionicons name="thermometer" size={32} color="#FF9500" />
            <Text style={dynamicStyles.metricText}>Temperature</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.metricButton} onPress={() => openModal('glucose')}>
            <Ionicons name="water" size={32} color="#34C759" />
            <Text style={dynamicStyles.metricText}>Blood Glucose</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.metricButton} onPress={() => openModal('weight')}>
            <Ionicons name="scale" size={32} color="#5856D6" />
            <Text style={dynamicStyles.metricText}>Weight</Text>
          </TouchableOpacity>
        </View>

        <Text style={dynamicStyles.sectionTitle}>Trends</Text>
        <View style={styles.chartSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['heart_rate', 'blood_pressure', 'temperature', 'glucose', 'weight'] as HealthMetric[]).map(metric => (
              <TouchableOpacity
                key={metric}
                style={[
                  dynamicStyles.chartSelectorButton,
                  chartMetric === metric && { backgroundColor: getMetricColor(metric) }
                ]}
                onPress={() => setChartMetric(metric)}
              >
                <Text style={[
                  dynamicStyles.chartSelectorText,
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
          unit={` ${getMetricUnit(chartMetric)}`}
          height={180}
        />

        <Text style={dynamicStyles.sectionTitle}>Recent Records</Text>

        {records.length === 0 ? (
          <Text style={dynamicStyles.emptyText}>No health records yet. Start logging!</Text>
        ) : (
          records.map((record) => (
            <View key={record.id} style={dynamicStyles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={dynamicStyles.recordType}>{getMetricLabel(record.type)}</Text>
                <TouchableOpacity onPress={() => handleDelete(record.id)}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
              <Text style={dynamicStyles.recordValue}>
                {formatDisplayValue(record.type, record.value)}
              </Text>
              {record.notes ? <Text style={dynamicStyles.recordNotes}>{record.notes}</Text> : null}
              <Text style={dynamicStyles.recordDate}>{new Date(record.recorded_at + 'Z').toLocaleString()}</Text>
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
            <Text style={dynamicStyles.modalTitle}>Log {getMetricLabel(selectedMetric)}</Text>

            <Text style={dynamicStyles.label}>Value ({getMetricUnit(selectedMetric)})</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder={`e.g., ${getMetricPlaceholder(selectedMetric)}`}
              placeholderTextColor={colors.secondaryText}
              value={value}
              onChangeText={setValue}
              keyboardType={selectedMetric === 'blood_pressure' ? 'default' : 'decimal-pad'}
            />

            <Text style={dynamicStyles.label}>Notes (Optional)</Text>
            <TextInput
              style={[dynamicStyles.input, styles.textArea]}
              placeholder="Add any notes..."
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  chartSelector: {
    marginBottom: 10,
  },
  chartSelectorTextActive: {
    color: '#fff',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
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