import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dptxgtkrkahftbfcoazb.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdHhndGtya2FoZnRiZmNvYXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNjQ2NTAsImV4cCI6MjEwMTk0MDY1MH0.jeQgvTb-s2Z-CQIhBKSwxrg-5lAkkJFagO9BgV00lxw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
