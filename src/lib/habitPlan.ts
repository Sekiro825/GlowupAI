import { supabase } from './supabase';
import { generateHabitPlan, HabitPlanItem } from './fastrouter';

// Generate a habit plan via AI and save all habits to Supabase for the current user.
// Returns the number of habits successfully inserted.
export async function generateAndSaveHabits(goal: string): Promise<number> {
  if (!goal || !goal.trim()) {
    throw new Error('Please provide a goal');
  }

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const plan: HabitPlanItem[] = await generateHabitPlan(goal.trim());
  if (!plan || plan.length === 0) {
    throw new Error('AI did not return any habits');
  }

  const rows = plan.map(item => ({
    user_id: user.id,
    title: item.title,
    description: item.description,
    emoji: item.emoji,
    completed_today: false,
    streak_count: 0,
  }));

  const { data, error } = await supabase
    .from('habits')
    .insert(rows)
    .select();

  if (error) {
    throw new Error('Failed to save habits: ' + error.message);
  }

  return data?.length ?? 0;
}

