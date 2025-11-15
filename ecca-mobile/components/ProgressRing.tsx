import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export default function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 10,
  color = '#007AFF',
  label,
}: ProgressRingProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Create segments to simulate a circular progress bar
  const segments = 40;
  const segmentAngle = 360 / segments;
  const filledSegments = Math.round((clampedProgress / 100) * segments);

  return (
    <View style={styles.container}>
      <View style={[styles.ring, { width: size, height: size }]}>
        {/* Background ring */}
        <View
          style={[
            styles.backgroundRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: '#E0E0E0',
            },
          ]}
        />

        {/* Progress segments */}
        {Array.from({ length: segments }).map((_, index) => {
          if (index >= filledSegments) return null;
          
          const rotation = index * segmentAngle;
          return (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  width: size,
                  height: size,
                  transform: [{ rotate: `${rotation}deg` }],
                },
              ]}
            >
              <View
                style={[
                  styles.segmentFill,
                  {
                    width: strokeWidth,
                    height: size / 2,
                    backgroundColor: color,
                    borderRadius: strokeWidth / 2,
                  },
                ]}
              />
            </View>
          );
        })}

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundRing: {
    position: 'absolute',
  },
  segment: {
    position: 'absolute',
    alignItems: 'center',
  },
  segmentFill: {
    position: 'absolute',
    top: 0,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});