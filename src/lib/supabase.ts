import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ewjfnquypoeyoicmgbnp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3amZucXV5cG9leW9pY21nYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNDU1MjYsImV4cCI6MjA2NjkyMTUyNn0.546O8Q0S3kIGvLnZ_xK5MrrCFQBhcJ-jwPDaz4KK_Qo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)