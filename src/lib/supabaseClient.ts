/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;
let SUPABASE_CONFIGURED = true;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    env: import.meta.env.MODE
  });
  // Create a dummy client to prevent app crash
  // This allows the Home page to render while showing an error for protected routes
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
  SUPABASE_CONFIGURED = false;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase, SUPABASE_CONFIGURED };

export type { User, Session } from '@supabase/supabase-js';
