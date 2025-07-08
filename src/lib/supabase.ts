import { createClient } from '@supabase/supabase-js'
import { config } from '@/config/env'

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false, // デバッグモードを無効化
  },
})
