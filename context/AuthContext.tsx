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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supported = IdentityService.isSupported();
        setIsPassKeySupported(supported);
        
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

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        EphemeralStorage.clear();
        console.log('Ephemeral storage cleared due to app state change');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const login = async (userId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const isValid = await IdentityService.verifyPassKey(userId);
      const user = await IdentityService.getPassKeyById(userId);
      
      if (isValid && user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        return true;
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
    
    setTimeout(() => {
      setCurrentUser(null);
      setIsAuthenticated(false);
      EphemeralStorage.clear();
      setIsLoading(false);
    }, 800);
  };

  const createAccount = async () => {
    setIsLoading(true);
    
    try {
      const newPassKey = await IdentityService.createPassKey();
      
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
      await IdentityService.deletePassKey(userId);
      
      const updatedPasskeys = await IdentityService.getPassKeys();
      console.log("DEBUG", updatedPasskeys);
      setUsers(updatedPasskeys);
      
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        EphemeralStorage.clear();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
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