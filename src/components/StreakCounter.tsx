import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius } from '../theme/tokens';

interface StreakCounterProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  count,
  size = 'medium',
}) => {
  const getStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
          emoji: styles.smallEmoji,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
          emoji: styles.largeEmoji,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
          emoji: styles.mediumEmoji,
        };
    }
  };

  const styleSet = getStyles();

  return (
    <LinearGradient
      colors={[colors.secondary, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradient, styleSet.container]}
    >
      <Text style={styleSet.emoji}>🔥</Text>
      <Text style={[styles.baseText, styleSet.text]}>{count}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  baseText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 4,
  },
  smallContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smallText: {
    fontSize: typography.fontSize.sm,
  },
  smallEmoji: {
    fontSize: 14,
  },
  mediumContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mediumText: {
    fontSize: typography.fontSize.lg,
  },
  mediumEmoji: {
    fontSize: 18,
  },
  largeContainer: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  largeText: {
    fontSize: typography.fontSize['2xl'],
  },
  largeEmoji: {
    fontSize: 28,
  },
});