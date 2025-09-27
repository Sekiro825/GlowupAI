# Supabase Database Setup Guide

This guide will help you set up the required database tables for the GlowUp AI app.

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  streak_count INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  height INTEGER,
  weight INTEGER,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow public read access for leaderboard
CREATE POLICY "Public can view users for leaderboard" ON users
  FOR SELECT USING (true);
```

### 2. Habits Table
```sql
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  completed_today BOOLEAN DEFAULT FALSE,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Habit Tips Table (Optional - for AI features)
```sql
CREATE TABLE habit_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE habit_tips ENABLE ROW LEVEL SECURITY;

-- Allow public read access for tips
CREATE POLICY "Public can view habit tips" ON habit_tips
  FOR SELECT USING (true);
```

## Setup Steps

1. **Create a new Supabase project** at https://supabase.com
2. **Run the SQL commands above** in your Supabase SQL editor
3. **If you already have a users table, add the new columns:**
   ```sql
   ALTER TABLE users ADD COLUMN height INTEGER;
   ALTER TABLE users ADD COLUMN weight INTEGER;
   ALTER TABLE users ADD COLUMN age INTEGER;
   ```
4. **Update your app.json** with your Supabase URL and anon key:
   ```json
   {
     "expo": {
       "extra": {
         "supabaseUrl": "YOUR_SUPABASE_URL",
         "supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"
       }
     }
   }
   ```

## Authentication Setup

1. **Enable Email Authentication** in your Supabase dashboard:
   - Go to Authentication > Settings
   - Enable "Enable email confirmations" if desired
   - Configure your site URL for redirects

2. **Set up email templates** (optional):
   - Customize the email templates in Authentication > Email Templates

## Testing the Setup

1. **Test user registration** by creating an account through the app
2. **Test habit creation** by adding habits in the app
3. **Test leaderboard** by creating multiple users and adding habits

## Notes

- The app will automatically create user records when users sign up
- All data is protected by Row Level Security (RLS)
- Users can only access their own data
- The leaderboard allows public read access to display names and scores
- Habit tips are publicly readable for the AI features
