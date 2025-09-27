import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../src/theme/tokens';

export default function IndexScreen() {
  useEffect(() => {
    // Simulate auth check - in real app, check authentication state
    const timer = setTimeout(() => {
      // For demo purposes, redirect to login
      // In real app, redirect to (tabs) if authenticated
      router.replace('/auth/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌞</Text>
      <Text style={styles.title}>GlowUp AI</Text>
      <Text style={styles.subtitle}>Loading your wellness journey...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
});