import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If Supabase is not configured, skip auth setup
    if (!SUPABASE_CONFIGURED) {
      setLoading(false);
      setError('Supabase configuration missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error getting session:', err);
        setLoading(false);
      });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!SUPABASE_CONFIGURED) {
      throw new Error('Authentication not available. Supabase is not configured.');
    }
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign up';
      setError(message);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!SUPABASE_CONFIGURED) {
      throw new Error('Authentication not available. Supabase is not configured.');
    }
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign in';
      setError(message);
      throw err;
    }
  };

  const signOut = async () => {
    if (!SUPABASE_CONFIGURED) {
      throw new Error('Authentication not available. Supabase is not configured.');
    }
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign out';
      setError(message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        error,
        clearError,
        isConfigured: SUPABASE_CONFIGURED,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
