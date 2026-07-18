import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://duozqtxawltanwjpxibk.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1b3pxdHhhd2x0YW53anB4aWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMjc2MTYsImV4cCI6MjA5OTcwMzYxNn0.nOhvAvudDzkST5NdwuMfalTVkZbK_4saS08NZdK3aXA';

// Validate that keys are not empty or default placeholder strings
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' && 
  !supabaseUrl.includes('YOUR_') && 
  !supabaseAnonKey.includes('YOUR_')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
