import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase configuration from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your app.json extra fields.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for our database schema
export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  streak_count: number;
  total_points: number;
  badges: string[];
  height?: number;
  weight?: number;
  age?: number;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string;
  emoji: string;
  completed_today: boolean;
  streak_count: number;
  created_at: string;
}

export interface HabitTip {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  created_at: string;
}