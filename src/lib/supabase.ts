import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log('Environment check:');
console.log('- VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'MISSING');
console.log('- VITE_SUPABASE_ANON_KEY length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
console.log('- All env vars:', Object.keys(import.meta.env).filter(k => k.includes('SUPABASE')));

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials:');
  console.error('- URL:', supabaseUrl);
  console.error('- Key exists:', !!supabaseAnonKey);
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify Environment Variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    timeout: 20000, // Increase realtime timeout
  },
});

// Test connection
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session ? 'has session' : 'no session');
});
