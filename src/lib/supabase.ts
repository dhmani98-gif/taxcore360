import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://xcnkegvtqwtaodvogbij.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbmtlZ3Z0cXd0YW9kdm9nYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTA4MzEsImV4cCI6MjA5MjM4NjgzMX0.qhO6O9aZfUkFltLt-ZuQDiRPA43f7-iDO6GJRpwbWCA';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
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
