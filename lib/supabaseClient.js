// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmalgysggobkgcfgywca.supabase.co'; // 본인 프로젝트 URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtYWxneXNnZ29ia2djZmd5d2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0ODIzNiwiZXhwIjoyMDY2OTI0MjM2fQ.h_ZUY9mPRtFZgVDCXN7O00TYPl9Gi4-rt_xPGqA2N30';        // 본인 anon 키

export const supabase = createClient(supabaseUrl, supabaseAnonKey);