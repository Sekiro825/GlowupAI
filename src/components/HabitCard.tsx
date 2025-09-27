import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';
import { PrimaryButton } from './PrimaryButton';
import { StreakCounter } from './StreakCounter';

interface HabitCardProps {
  emoji: string;
  title: string;
  description: string;
  streak?: number;
  completed?: boolean;
  onComplete?: () => void;
  showAction?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  emoji,
  title,
  description,
  streak,
  completed = false,
  onComplete,
  showAction = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (completed) {
      // Fade in animation for completed state
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [completed, fadeAnim]);

  const handlePress = () => {
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onComplete?.();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.header}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        {streak !== undefined && (
          <StreakCounter count={streak} size="small" />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {showAction && (
        <View style={styles.actionContainer}>
          {completed ? (
            <Animated.View style={[styles.completedContainer, { opacity: fadeAnim }]}>
              <Text style={styles.completedEmoji}>✅</Text>
              <Text style={styles.completedText}>Completed!</Text>
            </Animated.View>
          ) : (
            <PrimaryButton
              title="Mark as Done"
              onPress={handlePress}
              variant="secondary"
            />
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  actionContainer: {
    alignItems: 'center',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
  },
  completedEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  completedText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});