import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://roujzwsuigacbzhhffln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvdWp6d3N1aWdhY2J6aGhmZmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzg3NDAsImV4cCI6MjA5MDgxNDc0MH0.e-rsf8WRPvjaFFeCtaTGikNB_ded-txCpvDY_8jK5Cs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});