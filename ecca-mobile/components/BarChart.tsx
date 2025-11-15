import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  height?: number;
}

export default function BarChart({ data, maxValue, height = 200 }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  const chartHeight = height - 80;

  return (
    <View style={styles.container}>
      {/* Y-axis label */}
      <View style={styles.yAxisContainer}>
        <Text style={styles.yAxisLabel}>{max}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.yAxisLabel}>0</Text>
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { height }]}>
        {/* Background grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, { top: '50%' }]} />
          <View style={[styles.gridLine, { bottom: 0 }]} />
        </View>

        {/* Data bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barHeight = (item.value / max) * chartHeight;
            
            return (
              <View key={index} style={styles.barColumn}>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  {/* Value label on top */}
                  <Text style={[styles.valueLabel, { color: item.color || '#007AFF' }]}>
                    {item.value}
                  </Text>
                  
                  {/* Bar */}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, 5),
                        backgroundColor: item.color || '#007AFF',
                      },
                    ]}
                  />
                </View>
                
                {/* X-axis label */}
                <Text style={styles.label} numberOfLines={2}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  yAxisContainer: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingVertical: 20,
  },
  yAxisLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    bottom: 50,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingBottom: 40,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    maxWidth: 80,
  },
  bar: {
    width: 40,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 5,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  label: {
    position: 'absolute',
    bottom: -30,
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    width: '100%',
  },
});