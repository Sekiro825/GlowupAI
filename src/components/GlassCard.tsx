import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows } from '../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'sage';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'primary',
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'secondary':
        return ['rgba(255, 181, 167, 0.15)', 'rgba(255, 181, 167, 0.05)'];
      case 'sage':
        return ['rgba(185, 214, 197, 0.15)', 'rgba(185, 214, 197, 0.05)'];
      default:
        return ['rgba(199, 160, 245, 0.15)', 'rgba(199, 160, 245, 0.05)'];
    }
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  gradient: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    padding: 20,
  },
});