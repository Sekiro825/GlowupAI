import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, Alert, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../theme/tokens';
import { PrimaryButton } from '../../components/PrimaryButton';
import { GlassCard } from '../../components/GlassCard';
import { StreakCounter } from '../../components/StreakCounter';
import { ProgressChart } from '../../components/ProgressChart';
import { router } from 'expo-router';
import { supabase, User, Habit } from '../../lib/supabase';
import { fetchUserAnalytics, UserAnalytics } from '../../lib/analytics';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Profile editing state
  const [displayName, setDisplayName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');

  // Fetch user data and habits on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch analytics when user data is loaded
  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (userError) {
        console.error('Supabase Error fetching user profile:', userError);
        Alert.alert('Error', 'Failed to fetch user profile: ' + userError.message);
        setLoading(false);
        return;
      }

      // If user doesn't exist, create a new user record
      if (!userData) {
        console.log('User not found in database, creating new user record...');
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            display_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            streak_count: 0,
            total_points: 0,
            badges: [],
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          Alert.alert('Error', 'Failed to create user profile: ' + createError.message);
          setLoading(false);
          return;
        }

        setUser(newUser);
        setDisplayName(newUser.display_name || '');
        setHeight(newUser.height?.toString() || '');
        setWeight(newUser.weight?.toString() || '');
        setAge(newUser.age?.toString() || '');
      } else {
        setUser(userData);
        
        // Populate editing state
        setDisplayName(userData.display_name || '');
        setHeight(userData.height?.toString() || '');
        setWeight(userData.weight?.toString() || '');
        setAge(userData.age?.toString() || '');
      }

      // Fetch user's habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', authUser.id);

      if (habitsError) {
        Alert.alert('Error', 'Failed to fetch habits');
        return;
      }

      setHabits(habitsData || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setAnalyticsLoading(true);
    try {
      const analyticsData = await fetchUserAnalytics(user.id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleUpgrade = () => {
    Alert.alert(
      'GlowUp+ Premium',
      'Unlock advanced analytics, custom habits, and exclusive content! 🌟',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Learn More', onPress: () => console.log('Upgrade pressed') },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        Alert.alert('Error', 'User not authenticated. Please log in again.');
        setSaving(false);
        return;
      }

      const updateData: any = {};
      
      // Always update display_name if it's different
      if (displayName.trim() !== (user.display_name || '')) {
        updateData.display_name = displayName.trim();
      }
      
      // Handle height
      if (height.trim()) {
        const heightNum = parseInt(height.trim());
        if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
          Alert.alert('Error', 'Please enter a valid height (1-300 cm)');
          setSaving(false);
          return;
        }
        updateData.height = heightNum;
      } else {
        updateData.height = null; // Clear height if empty
      }
      
      // Handle weight
      if (weight.trim()) {
        const weightNum = parseInt(weight.trim());
        if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
          Alert.alert('Error', 'Please enter a valid weight (1-500 kg)');
          setSaving(false);
          return;
        }
        updateData.weight = weightNum;
      } else {
        updateData.weight = null; // Clear weight if empty
      }
      
      // Handle age
      if (age.trim()) {
        const ageNum = parseInt(age.trim());
        if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
          Alert.alert('Error', 'Please enter a valid age (1-150 years)');
          setSaving(false);
          return;
        }
        updateData.age = ageNum;
      } else {
        updateData.age = null; // Clear age if empty
      }

      // Check if there are any changes
      const hasChanges = Object.keys(updateData).length > 0;
      if (!hasChanges) {
        Alert.alert('Info', 'No changes to save.');
        setEditing(false);
        setSaving(false);
        return;
      }

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', authUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile: ' + error.message);
        setSaving(false);
        return;
      }

      if (updatedUser) {
        // Update local user state with the returned data
        setUser(updatedUser);
        setEditing(false);
        Alert.alert('Success', 'Profile updated successfully! 🎉');
      }
    } catch (error: any) {
      console.error('Unexpected error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setDisplayName(user.display_name || '');
      setHeight(user.height?.toString() || '');
      setWeight(user.weight?.toString() || '');
      setAge(user.age?.toString() || '');
    }
    setEditing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const totalHabits = habits.length;
  const completedToday = habits.filter(habit => habit.completed_today).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No user data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile 👤</Text>
        </View>

        {/* User Profile */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>Profile Information</Text>
            {!editing ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateProfile}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[colors.primary, colors.sage]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            </LinearGradient>
          </View>
          
          {editing ? (
            <View style={styles.editForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.text.muted}
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="170"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="70"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="25"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                />
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.displayName}>{user.display_name || 'User'}</Text>
              <Text style={styles.email}>{user.email}</Text>
              
              {(user.height || user.weight || user.age) && (
                <View style={styles.personalInfo}>
                  {user.height && (
                    <Text style={styles.personalInfoText}>Height: {user.height}cm</Text>
                  )}
                  {user.weight && (
                    <Text style={styles.personalInfoText}>Weight: {user.weight}kg</Text>
                  )}
                  {user.age && (
                    <Text style={styles.personalInfoText}>Age: {user.age}</Text>
                  )}
                </View>
              )}
            </View>
          )}
          
          <View style={styles.mainStreak}>
            <StreakCounter count={user.streak_count} size="large" />
            <Text style={styles.streakLabel}>Current Streak</Text>
          </View>
        </GlassCard>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <GlassCard variant="primary" style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statNumber}>{totalHabits}</Text>
            <Text style={styles.statLabel}>Total Habits</Text>
          </GlassCard>

          <GlassCard variant="secondary" style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statNumber}>{user.total_points}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </GlassCard>

          <GlassCard variant="sage" style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statNumber}>{completedToday}</Text>
            <Text style={styles.statLabel}>Done Today</Text>
          </GlassCard>

          <GlassCard variant="primary" style={styles.statCard}>
            <Text style={styles.statEmoji}>🏅</Text>
            <Text style={styles.statNumber}>{user.badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </GlassCard>
        </View>

        {/* Badges */}
        <GlassCard style={styles.badgesCard}>
          <Text style={styles.badgesTitle}>Your Badges 🏆</Text>
          <View style={styles.badgesContainer}>
            {user.badges.map((badge, index) => (
              <View key={index} style={styles.badgeItem}>
                <Text style={styles.badgeEmoji}>{badge}</Text>
              </View>
            ))}
            {/* Placeholder for more badges */}
            <View style={styles.badgeItem}>
              <Text style={styles.badgePlaceholder}>+</Text>
            </View>
          </View>
          <Text style={styles.badgesSubtitle}>
            Keep completing habits to earn more badges!
          </Text>
        </GlassCard>

        {/* Progress Analytics */}
        <GlassCard variant="sage" style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Progress Analytics 📊</Text>
          
          {analyticsLoading ? (
            <View style={styles.analyticsLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
          ) : analytics ? (
            <View>
              {/* All-time Streak */}
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionTitle}>All-Time Best Streak</Text>
                <View style={styles.streakContainer}>
                  <Text style={styles.streakNumber}>{analytics.allTimeStreak}</Text>
                  <Text style={styles.streakLabel}>days</Text>
                </View>
              </View>

              {/* Weekly Progress Chart */}
              <View style={styles.analyticsSection}>
                <ProgressChart
                  data={analytics.weeklyProgress.map(week => ({
                    label: week.week,
                    value: week.points,
                    maxValue: Math.max(...analytics.weeklyProgress.map(w => w.points), 1),
                  }))}
                  title="Weekly Points Progress"
                  type="bar"
                  color={colors.primary}
                />
              </View>

              {/* Current Week Stats */}
              <View style={styles.analyticsSection}>
                <Text style={styles.sectionTitle}>This Week's Performance</Text>
                <View style={styles.weekStats}>
                  <View style={styles.weekStat}>
                    <Text style={styles.weekStatNumber}>{analytics.currentWeekStats.habitsCompleted}</Text>
                    <Text style={styles.weekStatLabel}>Completed</Text>
                  </View>
                  <View style={styles.weekStat}>
                    <Text style={styles.weekStatNumber}>{analytics.currentWeekStats.totalHabits}</Text>
                    <Text style={styles.weekStatLabel}>Total Habits</Text>
                  </View>
                  <View style={styles.weekStat}>
                    <Text style={styles.weekStatNumber}>{analytics.currentWeekStats.points}</Text>
                    <Text style={styles.weekStatLabel}>Points</Text>
                  </View>
                </View>
                <View style={styles.completionRate}>
                  <Text style={styles.completionRateText}>
                    Completion Rate: {analytics.habitCompletionRate.toFixed(1)}%
                  </Text>
                  <View style={styles.completionBar}>
                    <View 
                      style={[
                        styles.completionFill, 
                        { width: `${analytics.habitCompletionRate}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>

              {/* Monthly Progress Chart */}
              <View style={styles.analyticsSection}>
                <ProgressChart
                  data={analytics.monthlyProgress.map(month => ({
                    label: month.month,
                    value: month.points,
                    maxValue: Math.max(...analytics.monthlyProgress.map(m => m.points), 1),
                  }))}
                  title="Monthly Points Progress"
                  type="line"
                  color={colors.sage}
                />
              </View>
            </View>
          ) : (
            <Text style={styles.noAnalyticsText}>No analytics data available</Text>
          )}
        </GlassCard>

        {/* Premium Upgrade */}
        <GlassCard variant="secondary" style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>Upgrade to GlowUp+ 🌟</Text>
          <Text style={styles.upgradeDescription}>
            Unlock advanced analytics, custom habits, AI coaching, and exclusive content!
          </Text>
          <PrimaryButton
            title="Upgrade Now"
            onPress={handleUpgrade}
            style={styles.upgradeButton}
          />
        </GlassCard>

        {/* Sign Out */}
        <PrimaryButton
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
        />
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
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  profileTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.text.muted,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.sage,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  editForm: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.text.muted + '30',
  },
  personalInfo: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  personalInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  displayName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  mainStreak: {
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  badgesCard: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  badgesTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  badgeItem: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.xs,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgePlaceholder: {
    fontSize: 24,
    color: colors.text.muted,
  },
  badgesSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  analyticsCard: {
    marginBottom: spacing.xl,
  },
  analyticsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  analyticsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  analyticsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  streakNumber: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  streakLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  weekStat: {
    alignItems: 'center',
    flex: 1,
  },
  weekStatNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
  },
  weekStatLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  completionRate: {
    marginTop: spacing.md,
  },
  completionRateText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  completionBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
  },
  completionFill: {
    height: '100%',
    backgroundColor: colors.sage,
    borderRadius: borderRadius.sm,
  },
  noAnalyticsText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  upgradeCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  upgradeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  upgradeDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  upgradeButton: {
    minWidth: 200,
  },
  signOutButton: {
    marginBottom: spacing.lg,
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
});