import { supabase } from './supabase';

export interface WeeklyProgress {
  week: string;
  points: number;
  habitsCompleted: number;
  totalHabits: number;
}

export interface MonthlyProgress {
  month: string;
  points: number;
  habitsCompleted: number;
  totalHabits: number;
}

export interface UserAnalytics {
  allTimeStreak: number;
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
  currentWeekStats: {
    habitsCompleted: number;
    totalHabits: number;
    points: number;
  };
  habitCompletionRate: number;
}

// Helper function to get start and end of week
const getWeekBounds = (date: Date) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// Helper function to get start and end of month
const getMonthBounds = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// Format date for display
const formatWeek = (date: Date) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatMonth = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const fetchUserAnalytics = async (userId: string): Promise<UserAnalytics> => {
  try {
    // Get all habits for the user
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    if (habitsError) {
      console.error('Error fetching habits:', habitsError);
      throw new Error('Failed to fetch habits');
    }

    if (!habits || habits.length === 0) {
      return {
        allTimeStreak: 0,
        weeklyProgress: [],
        monthlyProgress: [],
        currentWeekStats: {
          habitsCompleted: 0,
          totalHabits: 0,
          points: 0,
        },
        habitCompletionRate: 0,
      };
    }

    // Calculate all-time streak (longest streak across all habits)
    const allTimeStreak = Math.max(...habits.map(habit => habit.streak_count || 0));

    // Get current week stats
    const now = new Date();
    const { start: weekStart, end: weekEnd } = getWeekBounds(now);
    
    const currentWeekStats = {
      habitsCompleted: habits.filter(habit => habit.completed_today).length,
      totalHabits: habits.length,
      points: habits.reduce((sum, habit) => sum + (habit.streak_count || 0) * 10, 0), // 10 points per streak day
    };

    // Calculate weekly progress for the last 8 weeks
    const weeklyProgress: WeeklyProgress[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekDate = new Date(now);
      weekDate.setDate(now.getDate() - (i * 7));
      const { start, end } = getWeekBounds(weekDate);
      
      // For demo purposes, we'll simulate some data based on current habits
      // In a real app, you'd track completion history in a separate table
      const habitsInWeek = habits.length;
      const completedInWeek = Math.floor(Math.random() * (habitsInWeek + 1));
      const pointsInWeek = completedInWeek * 10;
      
      weeklyProgress.push({
        week: formatWeek(weekDate),
        points: pointsInWeek,
        habitsCompleted: completedInWeek,
        totalHabits: habitsInWeek,
      });
    }

    // Calculate monthly progress for the last 6 months
    const monthlyProgress: MonthlyProgress[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      const { start, end } = getMonthBounds(monthDate);
      
      // For demo purposes, we'll simulate some data
      const habitsInMonth = habits.length;
      const completedInMonth = Math.floor(Math.random() * (habitsInMonth * 4) + habitsInMonth);
      const pointsInMonth = completedInMonth * 10;
      
      monthlyProgress.push({
        month: formatMonth(monthDate),
        points: pointsInMonth,
        habitsCompleted: completedInMonth,
        totalHabits: habitsInMonth * 4, // Assuming 4 weeks per month
      });
    }

    // Calculate habit completion rate
    const habitCompletionRate = currentWeekStats.totalHabits > 0 
      ? (currentWeekStats.habitsCompleted / currentWeekStats.totalHabits) * 100 
      : 0;

    return {
      allTimeStreak,
      weeklyProgress,
      monthlyProgress,
      currentWeekStats,
      habitCompletionRate,
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};

// Get habit completion history for a specific time period
export const fetchHabitHistory = async (
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<{ date: string; completed: number; total: number }[]> => {
  try {
    // This would typically query a habit_completions table
    // For now, we'll return mock data based on current habits
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    if (!habits || habits.length === 0) {
      return [];
    }

    const history = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Simulate completion data
      const completed = Math.floor(Math.random() * (habits.length + 1));
      history.push({
        date: currentDate.toISOString().split('T')[0],
        completed,
        total: habits.length,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return history;
  } catch (error) {
    console.error('Error fetching habit history:', error);
    throw error;
  }
};
