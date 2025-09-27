import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius } from '../theme/tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadiusOverride?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadiusOverride,
  style,
}) => {
  const translateX = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: 300,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  return (
    <View style={[styles.container, { width, height, borderRadius: borderRadiusOverride ?? borderRadius.lg }, style]}>
      <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }] }>
        <LinearGradient
          colors={["#E9E6DA00", "#E9E6DA80", "#E9E6DA00"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E9E6DA',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
});

export const SkeletonBlock: React.FC<{ lines?: number; height?: number; gap?: number }>
  = ({ lines = 3, height = 14, gap = 8 }) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={height} style={{ marginBottom: i === lines - 1 ? 0 : gap }} />
      ))}
    </View>
  );
};

