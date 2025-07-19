interface Config {
  // Application
  appName: string
  appUrl: string
  appVersion: string
  
  // Supabase
  supabaseUrl: string
  supabaseAnonKey: string
  
  // Square Payment
  squareApplicationId?: string
  squareLocationId?: string
  squareEnvironment?: 'sandbox' | 'production'
  
  // Feature flags
  enableAnalytics: boolean
  enablePwa: boolean
  enablePremium: boolean
  debugMode: boolean
}

function getEnvVar(key: string, defaultValue?: string): string {
  try {
    const value = import.meta.env[key] || defaultValue
    if (!value) {
      console.warn(`Environment variable ${key} is not set, using default: ${defaultValue}`)
      return defaultValue || ''
    }
    return value
  } catch (error) {
    console.error(`Error reading environment variable ${key}:`, error)
    return defaultValue || ''
  }
}

function getOptionalEnvVar(key: string, defaultValue?: string): string | undefined {
  return import.meta.env[key] || defaultValue
}

function getBooleanEnvVar(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

// Safe config creation with fallbacks
function createConfig(): Config {
  try {
    return {
      // Application
      appName: getEnvVar('VITE_APP_NAME', 'castChat'),
      appUrl: getEnvVar('VITE_APP_URL', 'https://www.castchat.jp'),
      appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
      
      // Supabase
      supabaseUrl: getEnvVar('VITE_SUPABASE_URL', 'https://ewjfnquypoeyoicmgbnp.supabase.co'),
      supabaseAnonKey: getEnvVar(
        'VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3amZucXV5cG9leW9pY21nYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNDU1MjYsImV4cCI6MjA2NjkyMTUyNn0.546O8Q0S3kIGvLnZ_xK5MrrCFQBhcJ-jwPDaz4KK_Qo'
      ),
      
      // Square Payment
      squareApplicationId: getOptionalEnvVar('VITE_SQUARE_APPLICATION_ID'),
      squareLocationId: getOptionalEnvVar('VITE_SQUARE_LOCATION_ID'),
      squareEnvironment: (getOptionalEnvVar('VITE_SQUARE_ENVIRONMENT', 'sandbox') as 'sandbox' | 'production'),
      
      // Feature flags
      enableAnalytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS'),
      enablePwa: getBooleanEnvVar('VITE_ENABLE_PWA'),
      enablePremium: getBooleanEnvVar('VITE_ENABLE_PREMIUM'),
      debugMode: getBooleanEnvVar('VITE_DEBUG_MODE')
    }
  } catch (error) {
    console.error('Error creating config, using fallback values:', error)
    // Return minimal fallback config
    return {
      appName: 'castChat',
      appUrl: 'https://www.castchat.jp',
      appVersion: '1.0.0',
      supabaseUrl: 'https://ewjfnquypoeyoicmgbnp.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3amZucXV5cG9leW9pY21nYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNDU1MjYsImV4cCI6MjA2NjkyMTUyNn0.546O8Q0S3kIGvLnZ_xK5MrrCFQBhcJ-jwPDaz4KK_Qo',
      squareApplicationId: undefined,
      squareLocationId: undefined,
      squareEnvironment: 'sandbox',
      enableAnalytics: false,
      enablePwa: true,
      enablePremium: false,
      debugMode: false
    }
  }
}

export const config: Config = createConfig()

// Development helpers
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD

// Debug logging
export function debugLog(message: string, ...args: any[]) {
  if (config.debugMode && isDevelopment) {
    console.log(`[DEBUG] ${message}`, ...args)
  }
}

export function validateConfig() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missingVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingVars.join(', ')}\n` +
      'Using default values. Check .env.example for required configuration.'
    )
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  }
}