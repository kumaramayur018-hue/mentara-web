import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User } from '../utils/supabase/client';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          role: session.user.user_metadata?.role || 'user'
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          role: session.user.user_metadata?.role || 'user'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // First, check if user account is deleted
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const checkResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/auth/check-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      const checkResult = await checkResponse.json();

      if (checkResult.isBanned) {
        return { 
          error: checkResult.message || `Your account has been banned. Contact support for more details.` 
        };
      }

      if (checkResult.isDeleted) {
        return { 
          error: checkResult.message || `Account deleted by administrator: ${checkResult.deleteReason}. You may recreate your account.` 
        };
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      // Continue with login attempt even if check fails
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Update online status
    if (data.user) {
      try {
        const { projectId, publicAnonKey } = await import('../utils/supabase/info');
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/auth/update-status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ userId: data.user.id, isOnline: true }),
          }
        );
      } catch (error) {
        console.error('Failed to update online status:', error);
      }
    }

    return {};
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Get the project info
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      // Call our server endpoint for signup
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { error: result.error || 'Failed to create account' };
      }

      return {};
    } catch (error) {
      return { error: 'Network error. Please try again.' };
    }
  };

  const signOut = async () => {
    // Update online status before signing out
    if (user) {
      try {
        const { projectId, publicAnonKey } = await import('../utils/supabase/info');
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/auth/update-status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ userId: user.id, isOnline: false }),
          }
        );
      } catch (error) {
        console.error('Failed to update online status:', error);
      }
    }
    
    await supabase.auth.signOut();
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@mentara.com';

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};