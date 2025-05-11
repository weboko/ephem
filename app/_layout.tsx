import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { ContactsProvider } from '../context/ContactsContext';
import { WakuProvider } from '../context/WakuContext';
import { useEphemeralStorageCleanup } from '../utils/useEphemeralStorageCleanup';

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
      <WakuProvider>
        <ContactsProvider>
          <AppContainer>
            <StatusBar style="light" />
            <Slot />
          </AppContainer>
        </ContactsProvider>
      </WakuProvider>
    </AuthProvider>
  );
}
