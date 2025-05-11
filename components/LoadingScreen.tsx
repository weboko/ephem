import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

type LoadingScreenProps = {
  message?: string;
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'ESTABLISHING SECURE CONNECTION'
}) => {
  const [dots, setDots] = useState('.');
  const fadeAnim = useState(new Animated.Value(0.3))[0];

  // Blinking effect for the matrix-style UI
  useEffect(() => {
    const fadeAnimation = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(fadeAnimation).start();

    return () => {
      fadeAnim.stopAnimation();
    };
  }, [fadeAnim]);

  // Loading dots animation
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>CYPHERNET</Text>
        <Text style={styles.subtitle}>EPHEMERAL • SECURE • ENCRYPTED</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.loadingText}>{message}{dots}</Text>
          </Animated.View>
        </View>
        
        <Text style={styles.securityText}>[ INITIALIZING ENCRYPTION ]</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.large,
  },
  title: {
    ...Typography.title,
    color: Colors.primary,
    fontSize: 28,
    letterSpacing: 3,
    marginBottom: Spacing.small,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: Spacing.large * 2,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: Spacing.large,
  },
  loadingText: {
    color: Colors.terminal,
    marginTop: Spacing.medium,
    letterSpacing: 1,
    fontSize: 14,
  },
  securityText: {
    color: Colors.faded,
    fontSize: 12,
    letterSpacing: 1.5,
    marginTop: Spacing.large,
  },
});