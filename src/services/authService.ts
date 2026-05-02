import { supabase } from '../lib/supabase';
import type { AuthError } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  company_id?: string;
};

export type AuthResult = {
  success: boolean;
  user?: AuthUser;
  error?: string;
};

export const authService = {
  // Sign up new user
  signUp: async (email: string, password: string, fullName: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            role: 'Manager', // Default role for new users
            status: 'active',
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return {
        success: true,
        user: {
          id: data.user!.id,
          email: data.user!.email!,
          full_name: fullName,
          role: 'Manager',
        },
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError.message || 'Failed to sign up',
      };
    }
  },

  // Demo mode flag - set to true for offline development
  isDemoMode: false, // DISABLED - Production mode requires real authentication

  // Sign in existing user
  signIn: async (email: string, password: string): Promise<AuthResult> => {
    try {
      console.log('Starting sign in for:', email);
      
      // DEMO MODE: Disabled - Only real authentication allowed
      if (authService.isDemoMode) {
        console.log('Using DEMO authentication mode');
        const demoUser: AuthUser = {
          id: 'demo-' + Date.now(),
          email: email,
          full_name: 'Demo User',
          role: 'Admin',
          company_id: 'demo-company',
        };
        return { success: true, user: demoUser };
      }
      
      // Wrap supabase call with manual timeout
      let authResult: any;
      let authError: any;
      
      const timeoutId = setTimeout(() => {
        console.error('Auth call timed out after 20 seconds');
        authError = new Error('Unable to connect to authentication server. Please check your internet connection and try again.');
      }, 20000);
      
      try {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        authResult = result;
      } catch (err) {
        authError = err;
      } finally {
        clearTimeout(timeoutId);
      }
      
      if (authError) throw authError;
      if (!authResult) throw new Error('No response from authentication service');
      
      const { data, error } = authResult;
      if (error) throw error;
      if (!data?.user) throw new Error('No user data returned');

      console.log('Auth successful, user ID:', data.user.id);

      // Fetch user profile with timeout
      let profile: any = null;
      const profileTimeoutId = setTimeout(() => {
        console.log('Profile fetch timed out');
      }, 3000);
      
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        profile = profileData;
        console.log('Profile fetched:', profile);
      } catch (profileErr) {
        console.error('Error fetching profile (using defaults):', profileErr);
      } finally {
        clearTimeout(profileTimeoutId);
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email!,
          full_name: profile?.full_name || data.user.user_metadata?.full_name,
          role: profile?.role || 'Viewer',
          company_id: profile?.company_id,
        },
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to sign in' };
    }
  },

  // Sign out
  signOut: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError.message || 'Failed to sign out',
      };
    }
  },

  // Get current session
  getCurrentSession: async (): Promise<AuthResult> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (!session) {
        return { success: false, error: 'No active session' };
      }

      // Fetch user profile - don't wait for it to speed up loading
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      return {
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email!,
          full_name: profile?.full_name || session.user.user_metadata?.full_name,
          role: profile?.role || 'Viewer',
          company_id: profile?.company_id,
        },
      };
    } catch (error) {
      console.error('Error getting current session:', error);
      return { success: false, error: 'Failed to get session' };
    }
  },

  // Reset password
  resetPassword: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError.message || 'Failed to send reset email',
      };
    }
  },

  // Update password
  updatePassword: async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError.message || 'Failed to update password',
      };
    }
  },

  // Sign in with OAuth (Google, Microsoft, etc.)
  signInWithOAuth: async (provider: 'google' | 'microsoft' | 'apple' | 'github'): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError.message || `Failed to sign in with ${provider}`,
      };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: AuthUser | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          callback({
            id: session.user.id,
            email: session.user.email!,
            full_name: profile?.full_name,
            role: profile?.role || 'Viewer',
            company_id: profile?.company_id,
          });
        } else {
          callback(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  },
};
