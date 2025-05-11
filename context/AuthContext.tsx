import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import EphemeralStorage from '../utils/ephemeralStorage';
import IdentityService, { PassKey } from '../services/identity';
import { LoadingScreen } from '../components/LoadingScreen';

type User = PassKey;

type AuthContextType = {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  createAccount: () => Promise<void>;
  deleteAccount: (userId: string) => Promise<void>;
  isPassKeySupported: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPassKeySupported, setIsPassKeySupported] = useState(false);

  // Load users (passkeys) and check if passkeys are supported
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if passkeys are supported on this device
        const supported = IdentityService.isSupported();
        setIsPassKeySupported(supported);
        
        // Load all registered passkeys
        const passkeys = await IdentityService.getPassKeys();
        setUsers(passkeys);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Add AppState listener to clear ephemeral storage when app is closed or backgrounded
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is moving to background or about to be closed
        EphemeralStorage.clear();
        console.log('Ephemeral storage cleared due to app state change');
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Clean up the subscription when component unmounts
    return () => {
      subscription.remove();
    };
  }, []);

  const login = async (userId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Verify the passkey - this will now trigger OS authentication UI
      const isValid = await IdentityService.verifyPassKey(userId);
      
      if (isValid) {
        // Get the updated passkey (with lastUsed timestamp)
        const user = await IdentityService.getPassKeyById(userId);
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true);
    
    // Simulate logout process
    setTimeout(() => {
      setCurrentUser(null);
      setIsAuthenticated(false);
      // Also clear ephemeral storage on logout
      EphemeralStorage.clear();
      setIsLoading(false);
    }, 800);
  };

  const createAccount = async () => {
    setIsLoading(true);
    
    try {
      // Create a new passkey
      const newPassKey = await IdentityService.createPassKey();
      
      // Update local state
      setUsers(prevUsers => [...prevUsers, newPassKey]);
      setCurrentUser(newPassKey);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (userId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Delete the passkey from storage
      await IdentityService.deletePassKey(userId);
      
      // Update local state - force a fresh fetch of passkeys
      const updatedPasskeys = await IdentityService.getPassKeys();
      setUsers(updatedPasskeys);
      
      // If the deleted account was the current user, log them out
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        EphemeralStorage.clear();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error; // Re-throw so the UI can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    users,
    isAuthenticated,
    isLoading,
    login,
    logout,
    createAccount,
    deleteAccount,
    isPassKeySupported,
  };

  if (isLoading) {
    return <LoadingScreen message="INITIALIZING IDENTITY" />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}