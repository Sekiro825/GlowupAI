import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../theme/tokens';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StreakCounter } from '../../components/StreakCounter';
import { GlassCard } from '../../components/GlassCard';
import { fetchDailyTip, DailyTip, shouldFetchNewTip, markTipAsFetched } from '../../lib/fastrouter';
import { supabase, User, Habit } from '../../lib/supabase';

export default function HomeScreen() {
  const [currentTip, setCurrentTip] = useState<DailyTip>({
    title: 'Mindful Moment',
    description: 'Take a deep breath and set one positive intention for today.',
    emoji: '🧘‍♀️',
  });
  const [totalStreak, setTotalStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [activeHabits, setActiveHabits] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [tipLoading, setTipLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user data and habits on component mount
  useEffect(() => {
    fetchUserData();
    fetchDailyTipData();
  }, []);

  const fetchDailyTipData = async () => {
    try {
      if (await shouldFetchNewTip()) {
        setTipLoading(true);
        const tip = await fetchDailyTip();
        setCurrentTip(tip);
        await markTipAsFetched();
      }
    } catch (error) {
      console.error('Error fetching daily tip:', error);
      // Keep the default tip if API fails
    } finally {
      setTipLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_points, streak_count')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setTotalPoints(0);
        setTotalStreak(0);
      } else if (userData) {
        setTotalPoints(userData.total_points || 0);
        setTotalStreak(userData.streak_count || 0);
      } else {
        // No user data found, set defaults
        setTotalPoints(0);
        setTotalStreak(0);
      }

      // Fetch user's habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      if (habitsError) {
        console.error('Error fetching habits:', habitsError);
      } else {
        setActiveHabits(habitsData?.length || 0);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const getNewTip = async () => {
    setTipLoading(true);
    try {
      const tip = await fetchDailyTip();
      setCurrentTip(tip);
      await markTipAsFetched();
      // Show success message for fallback tips
      if (tip.title.includes('Hydrate') || tip.title.includes('Mindful') || tip.title.includes('Move')) {
        // This is likely a fallback tip, show a subtle message
        console.log('Using fallback tip - API may be unavailable');
      }
    } catch (error) {
      console.error('Error fetching new tip:', error);
      // Don't show error alert since we have fallback tips
      console.log('Using fallback tip due to error');
    } finally {
      setTipLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchDailyTipData();
    setRefreshing(false);
  };

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
          <Text style={styles.appTitle}>GlowUp AI 🌞</Text>
          <Text style={styles.welcomeText}>Ready to glow up today?</Text>
        </View>

        {/* Streak Counter */}
        <GlassCard style={styles.streakCard}>
          <View style={styles.streakContent}>
            <Text style={styles.streakTitle}>Your Glow Streak</Text>
            <StreakCounter count={totalStreak} size="large" />
            <Text style={styles.streakSubtitle}>Keep the momentum going! ✨</Text>
          </View>
        </GlassCard>

        {/* Daily Tip Card */}
        <View style={styles.tipCard}>
          <LinearGradient
            colors={[colors.background, colors.primary + '20']}
            style={styles.tipGradient}
          >
            <View style={styles.tipHeader}>
              <Text style={styles.tipCategory}>Daily Glow-Up Tip</Text>
              {tipLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.tipEmoji}>{currentTip.emoji}</Text>
              )}
            </View>
            
            <Text style={styles.tipTitle}>{currentTip.title}</Text>
            <Text style={styles.tipDescription}>{currentTip.description}</Text>
            
            <PrimaryButton
              title={tipLoading ? "Loading..." : "Get New Tip ✨"}
              onPress={getNewTip}
              loading={tipLoading}
              style={styles.tipButton}
            />
          </LinearGradient>
        </View>

        {/* Motivation Section */}
        <GlassCard variant="sage" style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>💫 Today's Affirmation</Text>
          <Text style={styles.motivationText}>
            "Small steps lead to big transformations. You're already on your way to becoming the best version of yourself."
          </Text>
        </GlassCard>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <GlassCard variant="secondary" style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statNumber}>{activeHabits}</Text>
            <Text style={styles.statLabel}>Active Habits</Text>
          </GlassCard>
          
          <GlassCard variant="primary" style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statNumber}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </GlassCard>
        </View>
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
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  streakCard: {
    marginBottom: spacing.xl,
  },
  streakContent: {
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  streakSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  tipCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  tipGradient: {
    padding: spacing.xl,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tipCategory: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipEmoji: {
    fontSize: 32,
  },
  tipTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tipDescription: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  tipButton: {
    alignSelf: 'center',
  },
  motivationCard: {
    marginBottom: spacing.xl,
  },
  motivationTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});