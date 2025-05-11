import { Ionicons } from '@expo/vector-icons';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { ContactsProvider } from '../context/ContactsContext';
import { Colors } from '../constants/theme';
import { useEphemeralStorageCleanup } from '../utils/useEphemeralStorageCleanup';
import EphemeralStorage from '../utils/ephemeralStorage';

function AppContainer({ children }: { children: React.ReactNode }) {
  // Use our cleanup hook at the app root level
  useEphemeralStorageCleanup('app-root', () => {
    // Additional cleanup logic can go here
    console.log('Running app-level cleanup before storage clear');
  });

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ContactsProvider>
        <AppContainer>
          <StatusBar style="light" />
          <Slot />
        </AppContainer>
      </ContactsProvider>
    </AuthProvider>
  );
}
