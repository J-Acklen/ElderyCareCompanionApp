import { View, Text, StyleSheet } from 'react-native';

export default function Health() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Monitoring</Text>
      <Text style={styles.subtitle}>Track vital signs and health metrics</Text>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});