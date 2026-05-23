// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mnwausyvtkonmkphrmpn.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_Vo-d_sDtDoCEZ9-tVF1a9Q_VRMKOlSx';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase URL or Anon Key is missing. Please configure .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
