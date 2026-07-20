'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import type { SessionUser } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: SessionUser;
  partnerUser: SessionUser;
  accessToken: string;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  currentUser: SessionUser;
  partnerUser: SessionUser;
  accessToken: string;
  children: ReactNode;
}

export function AuthProvider({
  currentUser,
  partnerUser,
  accessToken,
  children,
}: AuthProviderProps) {
  const supabase = useMemo(() => createBrowserSupabase(accessToken), [accessToken]);

  return (
    <AuthContext.Provider value={{ currentUser, partnerUser, accessToken, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
