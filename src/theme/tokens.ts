export const colors = {
  // Main backgrounds
  background: '#FAFAF5', // off-white, cream
  card: '#F3F1E7', // soft yellow-gray
  
  // Accent colors
  primary: '#C7A0F5', // muted lavender
  secondary: '#FFB5A7', // soft coral
  sage: '#B9D6C5', // accent sage
  
  // Text colors
  text: {
    primary: '#2D3748',
    secondary: '#4A5568',
    muted: '#718096',
  },
  
  // Status colors
  success: '#68D391',
  warning: '#F6AD55',
  error: '#FC8181',
  
  // Glassmorphism
  glass: 'rgba(199, 160, 245, 0.1)',
  glassCard: 'rgba(243, 241, 231, 0.6)',
};

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};