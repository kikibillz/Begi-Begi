import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If keys are missing, we'll use local mock storage to keep the app functional
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);
