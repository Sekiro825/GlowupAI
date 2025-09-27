import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';
import { StreakCounter } from './StreakCounter';

interface LeaderboardItemProps {
  rank: number;
  displayName: string;
  avatarUrl: string;
  streakCount: number;
  totalPoints: number;
  badges: string[];
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  rank,
  displayName,
  avatarUrl,
  streakCount,
  totalPoints,
  badges,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isTopThree = rank <= 3;
  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return { borderColor: '#FFD700', borderWidth: 3 }; // Gold
      case 2:
        return { borderColor: '#C0C0C0', borderWidth: 2 }; // Silver
      case 3:
        return { borderColor: '#CD7F32', borderWidth: 2 }; // Bronze
      default:
        return {};
    }
  };

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
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[
        styles.container, 
        isTopThree && styles.topThreeContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, isTopThree && styles.topThreeRank]}>
            #{rank}
          </Text>
        </View>

        <View style={[styles.avatarContainer, getRankStyle()]}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.displayName}>{displayName}</Text>
          <View style={styles.badgesContainer}>
            {badges.map((badge, index) => (
              <Text key={index} style={styles.badge}>{badge}</Text>
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StreakCounter count={streakCount} size="small" />
          <Text style={styles.points}>{totalPoints} pts</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  topThreeContainer: {
    backgroundColor: colors.background,
    ...shadows.md,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  topThreeRank: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
  },
  avatarContainer: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
  },
  infoContainer: {
    flex: 1,
  },
  displayName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  badgesContainer: {
    flexDirection: 'row',
  },
  badge: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});