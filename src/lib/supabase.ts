import { createClient } from '@supabase/supabase-js'
import { config } from '@/config/env'

// Safe Supabase client creation
function createSupabaseClient() {
  try {
    // Creating Supabase client

    if (!config.supabaseUrl) {
      throw new Error('Supabase URL is not configured')
    }
    
    if (!config.supabaseAnonKey) {
      throw new Error('Supabase anonymous key is not configured')
    }

    return createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: false, // デバッグモードを無効化
      },
    })
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    console.error('Config values:', {
      supabaseUrl: config.supabaseUrl,
      hasAnonKey: !!config.supabaseAnonKey,
      configKeys: Object.keys(config)
    })
    
    // Fallback client with default values
    return createClient(
      'https://ewjfnquypoeyoicmgbnp.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3amZucXV5cG9leW9pY21nYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNDU1MjYsImV4cCI6MjA2NjkyMTUyNn0.546O8Q0S3kIGvLnZ_xK5MrrCFQBhcJ-jwPDaz4KK_Qo',
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          debug: false,
        },
      }
    )
  }
}

export const supabase = createSupabaseClient()
