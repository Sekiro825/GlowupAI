# GlowUp AI - Feature Testing Guide

This guide will help you test the new habit creation and profile update features to ensure they work correctly with the Supabase backend.

## Prerequisites

1. **Database Setup**: Make sure you've run the SQL commands from `SUPABASE_SETUP.md` to add the new columns to your users table:
   ```sql
   ALTER TABLE users ADD COLUMN height INTEGER;
   ALTER TABLE users ADD COLUMN weight INTEGER;
   ALTER TABLE users ADD COLUMN age INTEGER;
   ```

2. **App Configuration**: Ensure your `app.json` has the correct Supabase URL and anon key.

## Testing Checklist

### ✅ Habit Creation Feature

#### Test 1: Create a New Habit
1. **Navigate to Habits Screen**
   - Open the app and go to the "Habits" tab
   - You should see a "+" button in the top-right corner of the header

2. **Open Add Habit Modal**
   - Tap the "+" button
   - A modal should slide up from the bottom with form fields

3. **Fill Out the Form**
   - **Title**: Enter a habit title (e.g., "Drink Water")
   - **Description**: Enter a description (e.g., "Stay hydrated throughout the day")
   - **Emoji**: Enter an emoji (e.g., "💧")
   - Tap "Add Habit"

4. **Verify Success**
   - You should see a success alert: "Habit created successfully! 🎉"
   - The modal should close
   - The new habit should appear at the top of your habits list
   - The habit should show with 0 streak count and not completed today

#### Test 2: Form Validation
1. **Test Required Fields**
   - Try submitting with empty title → Should show "Please enter a habit title"
   - Try submitting with empty emoji → Should show "Please enter an emoji for your habit"

2. **Test Character Limits**
   - Title: Max 50 characters
   - Description: Max 200 characters
   - Emoji: Max 2 characters

#### Test 3: Data Persistence
1. **Restart the App**
   - Close and reopen the app
   - Navigate to Habits screen
   - Your newly created habit should still be there

2. **Complete the Habit**
   - Tap the "Complete" button on your new habit
   - Verify the streak count increases
   - Verify the completion status updates

### ✅ Profile Update Feature

#### Test 1: Edit Profile Information
1. **Navigate to Profile Screen**
   - Go to the "Profile" tab
   - You should see an "Edit" button in the profile card

2. **Enter Edit Mode**
   - Tap the "Edit" button
   - The profile should switch to edit mode with input fields
   - You should see "Cancel" and "Save" buttons

3. **Update Information**
   - **Display Name**: Update your display name
   - **Height**: Enter your height in cm (e.g., 170)
   - **Weight**: Enter your weight in kg (e.g., 70)
   - **Age**: Enter your age (e.g., 25)
   - Tap "Save"

4. **Verify Success**
   - You should see a success alert: "Profile updated successfully! 🎉"
   - The profile should exit edit mode
   - Your updated information should be displayed

#### Test 2: Form Validation
1. **Test Numeric Validation**
   - Height: Try entering "abc" → Should show "Please enter a valid height"
   - Weight: Try entering "0" → Should show "Please enter a valid weight"
   - Age: Try entering "200" → Should show "Please enter a valid age"

2. **Test Cancel Functionality**
   - Make some changes in edit mode
   - Tap "Cancel"
   - Changes should be reverted to original values

#### Test 3: Data Persistence
1. **Restart the App**
   - Close and reopen the app
   - Go to Profile screen
   - Your updated profile information should still be there

2. **Verify Display**
   - Your personal information (height, weight, age) should be displayed below your email
   - Only filled fields should be shown

### ✅ Integration Testing

#### Test 1: User Authentication Flow
1. **Sign Out and Sign Back In**
   - Go to Profile → Sign Out
   - Sign back in with your credentials
   - Verify all your data (habits and profile) is still there

#### Test 2: Data Consistency
1. **Check Home Screen Stats**
   - Go to Home screen
   - Verify the "Active Habits" count matches your actual habits
   - Verify the "Total Points" reflects your user data

2. **Check Leaderboard**
   - Go to Leaderboard screen
   - Verify your rank and points are displayed correctly
   - Verify other users' data is visible

## Expected Behavior

### ✅ Success Scenarios
- All forms should validate input correctly
- Success messages should appear for successful operations
- Data should persist across app restarts
- UI should update immediately after successful operations
- Loading states should be shown during operations

### ❌ Error Scenarios
- Network errors should show appropriate error messages
- Invalid input should show validation errors
- Authentication errors should redirect to login
- Database errors should show user-friendly messages

## Troubleshooting

### Common Issues

1. **"User not authenticated" Error**
   - Solution: Sign out and sign back in
   - Check if your Supabase session is valid

2. **"Failed to create habit" Error**
   - Check your Supabase RLS policies
   - Ensure the habits table exists and has correct permissions

3. **"Failed to update profile" Error**
   - Check if the new columns (height, weight, age) exist in your users table
   - Verify RLS policies allow users to update their own data

4. **Data Not Persisting**
   - Check your internet connection
   - Verify Supabase configuration in app.json
   - Check Supabase dashboard for any errors

### Database Verification

You can verify data persistence by checking your Supabase dashboard:

1. **Go to Table Editor**
2. **Check `habits` table** - Should see your new habits
3. **Check `users` table** - Should see updated profile information

## Performance Notes

- Habit creation should be fast (< 2 seconds)
- Profile updates should be fast (< 2 seconds)
- App should handle offline scenarios gracefully
- Loading states should provide good user feedback

## Security Notes

- All data is protected by Row Level Security (RLS)
- Users can only access their own data
- Input validation prevents malicious data entry
- Authentication is required for all operations

---

**Note**: If you encounter any issues during testing, check the console logs for detailed error messages and refer to the Supabase dashboard for database-related problems.
