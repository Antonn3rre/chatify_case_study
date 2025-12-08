// lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Check if env variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Key. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);