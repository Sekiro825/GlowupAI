import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme/tokens';
import { HabitCard } from '../../components/HabitCard';
import { GlassCard } from '../../components/GlassCard';
import { AddHabitModal } from '../../components/AddHabitModal';
import { fetchDailyTip, DailyTip, shouldFetchNewTip, markTipAsFetched } from '../../lib/fastrouter';
import { supabase, Habit } from '../../lib/supabase';

function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyFocus, setDailyFocus] = useState<DailyTip>({
    title: 'Mindful Moment',
    description: 'Take a deep breath and set one positive intention for today.',
    emoji: '🧘‍♀️',
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingHabit, setAddingHabit] = useState(false);
  const [tipLoading, setTipLoading] = useState(false);

  // Fetch user's habits from Supabase
  useEffect(() => {
    fetchHabits();
    fetchDailyTipData();
  }, []);

  const fetchDailyTipData = async () => {
    try {
      if (await shouldFetchNewTip()) {
        setTipLoading(true);
        const tip = await fetchDailyTip();
        setDailyFocus(tip);
        await markTipAsFetched();
      }
    } catch (error) {
      console.error('Error fetching daily tip:', error);
      // Keep the default tip if API fails
    } finally {
      setTipLoading(false);
    }
  };

  const fetchHabits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Error', 'Failed to fetch habits');
        return;
      }

      setHabits(data || []);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const { error } = await supabase
        .from('habits')
        .update({
          completed_today: true,
          streak_count: habit.completed_today ? habit.streak_count : habit.streak_count + 1,
        })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Error', 'Failed to update habit');
        return;
      }

      // Update local state
      setHabits(prevHabits =>
        prevHabits.map(habit =>
          habit.id === habitId
            ? {
                ...habit,
                completed_today: true,
                streak_count: habit.completed_today ? habit.streak_count : habit.streak_count + 1,
              }
            : habit
        )
      );
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHabits();
    await fetchDailyTipData();
    setRefreshing(false);
  };

  const handleAddHabit = async (habitData: { title: string; description: string; emoji: string }) => {
    setAddingHabit(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: habitData.title,
          description: habitData.description,
          emoji: habitData.emoji,
          completed_today: false,
          streak_count: 0,
        })
        .select()
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to create habit: ' + error.message);
        return;
      }

      if (data) {
        // Add the new habit to the local state
        setHabits(prevHabits => [data, ...prevHabits]);
        Alert.alert('Success', 'Habit created successfully! 🎉');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while creating the habit');
    } finally {
      setAddingHabit(false);
    }
  };

  const completedToday = habits.filter(habit => habit.completed_today).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your habits...</Text>
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
          <View style={styles.headerContent}>
            <Text style={styles.title}>Your Habits ✅</Text>
            <Text style={styles.subtitle}>
              {completedToday} of {habits.length} completed today
            </Text>
          </View>
        </View>

        {/* Daily Focus */}
        <GlassCard style={styles.focusCard}>
          <View style={styles.focusHeader}>
            <Text style={styles.focusTitle}>🎯 Today's Focus</Text>
            {tipLoading && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>
          <HabitCard
            emoji={dailyFocus.emoji}
            title={dailyFocus.title}
            description={dailyFocus.description}
            showAction={false}
          />
        </GlassCard>

        {/* Progress Overview */}
        <GlassCard variant="sage" style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressEmoji}>
              {completedToday === habits.length ? '🎉' : '💪'}
            </Text>
          </View>
          <Text style={styles.progressText}>
            {completedToday === habits.length
              ? "Amazing! You've completed all your habits today! 🌟"
              : `Keep going! ${habits.length - completedToday} habits left to complete.`}
          </Text>
        </GlassCard>

        {/* My Habits Section */}
        <View style={styles.habitsSection}>
          <Text style={styles.sectionTitle}>My Habits</Text>
          {habits.length === 0 ? (
            <GlassCard style={styles.emptyStateCard}>
              <Text style={styles.emptyStateEmoji}>🌱</Text>
              <Text style={styles.emptyStateTitle}>Start Your Journey!</Text>
              <Text style={styles.emptyStateDescription}>
                You haven't created any habits yet. Tap the + button to add your first habit and begin your wellness journey!
              </Text>
              <PrimaryButton
                title="Add Your First Habit"
                onPress={() => setShowAddModal(true)}
                style={styles.emptyStateButton}
              />
            </GlassCard>
          ) : (
            habits.map((habit) => (
              <View key={habit.id} style={styles.habitContainer}>
                <HabitCard
                  emoji={habit.emoji}
                  title={habit.title}
                  description={habit.description}
                  streak={habit.streak_count}
                  completed={habit.completed_today}
                  onComplete={() => handleCompleteHabit(habit.id)}
                />
              </View>
            ))
          )}
        </View>

        {/* Motivational Footer */}
        <GlassCard variant="secondary" style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            "Consistency is the mother of mastery. Each small step counts! 🚀"
          </Text>
        </GlassCard>
      </ScrollView>

      {/* Add Habit Modal */}
      <AddHabitModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddHabit={handleAddHabit}
        loading={addingHabit}
      />
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.fabButtonText}>+</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  focusCard: {
    marginBottom: spacing.xl,
  },
  focusHeader: {
    marginBottom: spacing.lg,
  },
  focusTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progressEmoji: {
    fontSize: 24,
  },
  progressText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  habitsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  habitContainer: {
    marginBottom: spacing.lg,
  },
  motivationCard: {
    alignItems: 'center',
  },
  motivationText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
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
  fabButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  fabButtonText: {
    fontSize: 32,
    color: colors.background,
    lineHeight: 32,
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
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyStateButton: {
    minWidth: 200,
  },
});

export default HabitsScreen;