import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  reloadUser as authReloadUser,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  getAuthErrorMessage,
  onAuthStateChanged,
  signInWithEmail,
  signUpWithEmail,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearIsNewUser: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userNonce, setUserNonce] = useState(0);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged((authUser) => {
      console.log('Auth state changed:', authUser ? authUser.email : 'null');
      setUser(authUser);
      setUserNonce(prev => prev + 1); // Force update on auth change
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const result = await signInWithEmail(email, password);
      console.log('Login successful:', result.email);
      // Don't set user here - onAuthStateChanged will handle it
    } catch (err: any) {
      console.log('Login failed:', err.code);
      setError(getAuthErrorMessage(err.code));
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const result = await signUpWithEmail(email, password);
      console.log('Registration successful:', result.email);
      setIsNewUser(true); // Mark as new user for onboarding flow
      // Don't set user here - onAuthStateChanged will handle it
    } catch (err: any) {
      console.log('Registration failed:', err.code);
      setError(getAuthErrorMessage(err.code));
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      await authSignInWithGoogle();
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      console.log('Logging out...');
      
      // Clear user-specific AsyncStorage keys
      const userSpecificKeys = [
        '@tradex_reminder_settings',
        '@tradex_biometric_enabled', 
        '@tradex_privacy_enabled',
        '@tradex_post_signup_onboarding_complete',
        '@tradex_feature_tour_complete',
        '@tradex_ai_insights_cache',
      ];
      await AsyncStorage.multiRemove(userSpecificKeys);
      console.log('Cleared user-specific storage');
      
      await authSignOut();
      console.log('Logout successful');
      // Don't set user to null here - onAuthStateChanged will handle it
    } catch (err: any) {
      console.log('Logout failed:', err.message);
      setError(err.message);
    }
  };

  const clearError = () => setError(null);
  const clearIsNewUser = () => setIsNewUser(false);

  const refreshUser = async () => {
    try {
      const updatedUser = await authReloadUser();
      if (updatedUser) {
        // Force a new object reference to ensure state update
        console.log('User refreshed:', updatedUser.email, 'Verified:', updatedUser.emailVerified);
        setUser(updatedUser); 
        setUserNonce(prev => prev + 1); // CRITICAL: Force re-render even if user ref is same
      }
    } catch (error) {
      console.log('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading, // Only initial auth check, not login/register attempts
    isAuthenticated: !!user,
    isNewUser,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError,
    clearIsNewUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
