/**
 * Supabase Client SDK (frontend)
 *
 * Safe to use in the browser — uses the public anon key only.
 * Handles authentication (admin login). All database writes go through the
 * backend API (service-role); the anon client here is auth-only.
 *
 * Required env (.env.local):
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missing = [
  !supabaseUrl && 'VITE_SUPABASE_URL',
  !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
].filter(Boolean);

if (missing.length > 0) {
  console.error('❌ Missing Supabase env variables:', missing);
  console.error('Add these to your .env.local file. See .env.example for a template.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
