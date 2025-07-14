// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import getEnvVars from '../environment';

// 1. Get the environment-specific variables
const { supabaseUrl, supabaseKey } = getEnvVars();

// 2. Validate that the variables were loaded correctly
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing. Check your environments.ts file and configuration.");
}

// 3. Create and export the Supabase client as a singleton
export const supabase = createClient(supabaseUrl, supabaseKey);

