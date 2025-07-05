import { createClient } from '@supabase/supabase-js'
import { config, debugLog } from '@/config/env'

debugLog('Initializing Supabase client', {
  url: config.supabaseUrl,
  hasAnonKey: !!config.supabaseAnonKey,
})

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
