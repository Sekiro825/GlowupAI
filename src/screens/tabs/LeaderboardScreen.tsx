import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, Alert } from 'react-native';
import { colors, typography, spacing } from '../../theme/tokens';
import { LeaderboardItem } from '../../components/LeaderboardItem';
import { GlassCard } from '../../components/GlassCard';
import { supabase, User } from '../../lib/supabase';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard data on component mount
  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch leaderboard (top users by total_points)
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('users')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(10);

      if (leaderboardError) {
        Alert.alert('Error', 'Failed to fetch leaderboard');
        return;
      }

      setLeaderboard(leaderboardData || []);

      // Find current user's rank
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, total_points')
        .order('total_points', { ascending: false });

      if (!allUsersError && allUsers) {
        const userRank = allUsers.findIndex(u => u.id === user.id) + 1;
        setCurrentUserRank(userRank);

        // Get current user's full data
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (currentUserError) {
          console.error('Error fetching current user data:', currentUserError);
          setCurrentUser({
            id: user.id,
            email: user.email || '',
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            streak_count: 0,
            total_points: 0,
            badges: [],
            created_at: new Date().toISOString(),
          });
        } else if (currentUserData) {
          setCurrentUser(currentUserData);
        } else {
          // No user data found, create default
          setCurrentUser({
            id: user.id,
            email: user.email || '',
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            streak_count: 0,
            total_points: 0,
            badges: [],
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard 🏆</Text>
          <Text style={styles.subtitle}>See how you stack up against other GlowUp champions!</Text>
        </View>

        {/* Current User Card */}
        {currentUser && (
          <GlassCard variant="sage" style={styles.currentUserCard}>
            <View style={styles.currentUserHeader}>
              <Text style={styles.currentUserTitle}>Your Rank</Text>
              <Text style={styles.currentUserRank}>#{currentUserRank}</Text>
            </View>
            <LeaderboardItem
              rank={currentUserRank}
              displayName={currentUser.display_name || 'You'}
              avatarUrl={currentUser.avatar_url || ''}
              streakCount={currentUser.streak_count}
              totalPoints={currentUser.total_points}
              badges={currentUser.badges}
            />
          </GlassCard>
        )}

        {/* Trophy Section */}
        <GlassCard variant="secondary" style={styles.trophyCard}>
          <View style={styles.trophyHeader}>
            <Text style={styles.trophyEmoji}>👑</Text>
            <Text style={styles.trophyTitle}>Top Champions</Text>
            <Text style={styles.trophyEmoji}>👑</Text>
          </View>
          <Text style={styles.trophySubtitle}>
            These wellness warriors are leading the way!
          </Text>
        </GlassCard>

        {/* Leaderboard List */}
        <View style={styles.leaderboardSection}>
          {leaderboard.length === 0 ? (
            <GlassCard style={styles.emptyStateCard}>
              <Text style={styles.emptyStateEmoji}>🏆</Text>
              <Text style={styles.emptyStateTitle}>No Champions Yet!</Text>
              <Text style={styles.emptyStateDescription}>
                Be the first to start building habits and climb to the top of the leaderboard! 
                Create your first habit to begin your wellness journey.
              </Text>
            </GlassCard>
          ) : (
            leaderboard.map((user, index) => (
              <LeaderboardItem
                key={user.id}
                rank={index + 1}
                displayName={user.display_name || 'Anonymous'}
                avatarUrl={user.avatar_url || ''}
                streakCount={user.streak_count}
                totalPoints={user.total_points}
                badges={user.badges}
              />
            ))
          )}
        </View>

        {/* Motivation Card */}
        <GlassCard style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>💪 Level Up Your Game!</Text>
          <Text style={styles.motivationText}>
            Complete more habits daily to climb the leaderboard and earn exclusive badges. 
            Every streak counts towards your wellness journey!
          </Text>
        </GlassCard>

        {/* Badge Guide */}
        <GlassCard variant="primary" style={styles.badgeGuide}>
          <Text style={styles.badgeTitle}>🏅 Badge Guide</Text>
          <View style={styles.badgeList}>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>🔥</Text>
              <Text style={styles.badgeText}>Fire: 7+ day streak</Text>
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>💧</Text>
              <Text style={styles.badgeText}>Hydration: Water habit master</Text>
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>🧘‍♀️</Text>
              <Text style={styles.badgeText}>Zen: Meditation consistency</Text>
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>✨</Text>
              <Text style={styles.badgeText}>Glow: Skincare routine</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  currentUserCard: {
    marginBottom: spacing.xl,
  },
  currentUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  currentUserTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  currentUserRank: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.sage,
  },
  trophyCard: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  trophyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  trophyEmoji: {
    fontSize: 24,
    marginHorizontal: spacing.sm,
  },
  trophyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  trophySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  leaderboardSection: {
    marginBottom: spacing.xl,
  },
  motivationCard: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  motivationText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  badgeGuide: {
    alignItems: 'stretch',
  },
  badgeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  badgeList: {
    gap: spacing.md,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 30,
  },
  badgeText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
});