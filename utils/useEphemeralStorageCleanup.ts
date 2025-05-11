import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import EphemeralStorage from './ephemeralStorage';

/**
 * Hook to manage ephemeral storage cleanup when app state changes
 * @param cleanupId Unique ID to identify this cleanup handler (defaults to component name)
 * @param onCleanup Optional callback to run additional logic before storage is cleared
 */
export function useEphemeralStorageCleanup(
  cleanupId: string = 'default', 
  onCleanup?: () => void
): void {
  useEffect(() => {
    // Register the cleanup callback if provided
    if (onCleanup) {
      EphemeralStorage.registerCleanupCallback(cleanupId, onCleanup);
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is moving to background or about to be closed
        EphemeralStorage.clear();
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Clean up the subscription and callback registration when component unmounts
    return () => {
      subscription.remove();
      if (onCleanup) {
        EphemeralStorage.unregisterCleanupCallback(cleanupId);
      }
    };
  }, [cleanupId, onCleanup]);
}