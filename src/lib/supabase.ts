import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const hasSupabaseConfig = !!(supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'your-anon-key-here');

// If keys are missing, we'll use a proxy or check before usage to avoid crashes
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder');
