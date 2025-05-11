import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import EphemeralStorage from '../utils/ephemeralStorage';

type User = {
  id: string;
  name: string;
  profileImage?: string;
};

type AuthContextType = {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  createAccount: (name: string) => void;
};

const defaultUsers: User[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Alex Wilson' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    // Also clear ephemeral storage on logout
    EphemeralStorage.clear();
  };

  const createAccount = (name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
  };

  const value = {
    currentUser,
    users,
    isAuthenticated,
    login,
    logout,
    createAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}