import { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
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
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged((authUser) => {
      console.log('Auth state changed:', authUser ? authUser.email : 'null');
      setUser(authUser);
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
      await authSignOut();
      console.log('Logout successful');
      // Don't set user to null here - onAuthStateChanged will handle it
    } catch (err: any) {
      console.log('Logout failed:', err.message);
      setError(err.message);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading, // Only initial auth check, not login/register attempts
    isAuthenticated: !!user,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError,
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
