// src/context/AuthContext.tsx

'use client';

import { supabase } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define context
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

// 2. Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. AuthProvider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Retrieve session data and listen to auth modifications
  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    // Retrieve data about the session
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};