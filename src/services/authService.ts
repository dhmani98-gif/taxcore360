import { supabase } from '../lib/supabase';
import type { AuthError } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  company_id?: string;
  subscription_tier?: string;
  is_trial_active?: boolean;
  trial_ends_at?: string | null;
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data?.user) throw new Error('No user data returned');

      console.log('Auth successful, user ID:', data.user.id);

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name,
          role: 'Viewer',
          company_id: undefined,
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
      const { data: profile } = await supabase
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
          subscription_tier: profile?.subscription_tier,
          is_trial_active: profile?.is_trial_active,
          trial_ends_at: profile?.trial_ends_at ?? null,
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
      const supabaseProvider = provider === 'microsoft' ? 'azure' : provider;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider as any,
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
          // Fast path: notify immediately
          callback({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name,
            role: 'Viewer',
            company_id: undefined,
          });

          // Enrich asynchronously with profile data (no blocking)
          void (async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (!profile) return;

              callback({
                id: session.user.id,
                email: session.user.email!,
                full_name: profile.full_name ?? session.user.user_metadata?.full_name,
                role: profile.role || 'Viewer',
                company_id: profile.company_id,
                subscription_tier: profile.subscription_tier,
                is_trial_active: profile.is_trial_active,
                trial_ends_at: profile.trial_ends_at ?? null,
              });
            } catch (e) {
              console.error('Error fetching profile on auth state change:', e);
            }
          })();
        } else {
          callback(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  },
};
