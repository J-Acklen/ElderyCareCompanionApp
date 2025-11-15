import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface DataPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  unit?: string;
}

export default function TrendChart({ data, color = '#007AFF', height = 150, unit = '' }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 80;
  const chartWidth = screenWidth - 40;
  const chartHeight = height - 80;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  return (
    <View style={styles.container}>
      {/* Y-axis labels */}
      <View style={styles.yAxisContainer}>
        <Text style={styles.yAxisLabel}>{maxValue}{unit}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.yAxisLabel}>{minValue}{unit}</Text>
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { height }]}>
        {/* Background grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, { top: '50%' }]} />
          <View style={[styles.gridLine, { bottom: 0 }]} />
        </View>

        {/* Data bars and labels */}
        <View style={styles.barsContainer}>
          {data.map((point, index) => {
            const normalizedValue = (point.value - minValue) / valueRange;
            const barHeight = normalizedValue * chartHeight;

            return (
              <View key={index} style={styles.barColumn}>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  {/* Value label on top */}
                  <Text style={[styles.valueLabel, { color }]}>
                    {point.value}{unit}
                  </Text>
                  
                  {/* Bar */}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, 5),
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
                
                {/* X-axis label */}
                <Text style={styles.label}>{point.label}</Text>
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
    width: 50,
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingVertical: 20,
  },
  yAxisLabel: {
    fontSize: 11,
    color: '#666',
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
    bottom: 40,
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
    paddingBottom: 30,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  bar: {
    width: 30,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 5,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  label: {
    position: 'absolute',
    bottom: -30,
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});