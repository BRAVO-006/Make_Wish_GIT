import { createClient } from "@supabase/supabase-js";

// IMPORTANT: In CodeSandbox, set these as Secret Keys in the Server Control Panel.
// Do NOT paste your keys directly here.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
