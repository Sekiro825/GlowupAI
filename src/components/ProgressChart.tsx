import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/tokens';

interface ChartData {
  label: string;
  value: number;
  maxValue: number;
}

interface ProgressChartProps {
  data: ChartData[];
  title: string;
  type: 'bar' | 'line';
  color?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (spacing.lg * 2) - (spacing.md * 2); // Account for padding

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title,
  type = 'bar',
  color = colors.primary,
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 120;

  const renderBarChart = () => {
    return (
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (chartHeight - 20);
          const barWidth = (chartWidth - (data.length - 1) * spacing.sm) / data.length;
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      width: barWidth,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderLineChart = () => {
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * chartWidth,
      y: chartHeight - 20 - (item.value / maxValue) * (chartHeight - 20),
    }));

    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    return (
      <View style={styles.chartContainer}>
        <View style={styles.lineChartWrapper}>
          {/* Simple line representation using View components */}
          <View style={styles.lineChart}>
            {points.map((point, index) => (
              <View key={index}>
                <View
                  style={[
                    styles.linePoint,
                    {
                      left: point.x - 4,
                      top: point.y - 4,
                      backgroundColor: color,
                    },
                  ]}
                />
                {index < points.length - 1 && (
                  <View
                    style={[
                      styles.lineSegment,
                      {
                        left: point.x,
                        top: point.y,
                        width: Math.sqrt(
                          Math.pow(points[index + 1].x - point.x, 2) +
                          Math.pow(points[index + 1].y - point.y, 2)
                        ),
                        backgroundColor: color,
                        transform: [
                          {
                            rotate: `${Math.atan2(
                              points[index + 1].y - point.y,
                              points[index + 1].x - point.x
                            )}rad`,
                          },
                        ],
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
        <View style={styles.lineLabels}>
          {data.map((item, index) => (
            <Text key={index} style={styles.lineLabel} numberOfLines={1}>
              {item.label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {type === 'bar' ? renderBarChart() : renderLineChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  chartContainer: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  barWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderRadius: borderRadius.sm,
    minHeight: 2,
  },
  barLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  lineChartWrapper: {
    flex: 1,
    height: 100,
    position: 'relative',
  },
  lineChart: {
    flex: 1,
    position: 'relative',
  },
  linePoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    zIndex: 1,
  },
  lineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  lineLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    flex: 1,
  },
});
