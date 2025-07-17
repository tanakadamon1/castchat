import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 期限切れ優先表示を更新
    const { data, error } = await supabase.rpc('check_and_expire_priorities')

    if (error) {
      console.error('期限切れ更新エラー:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 現在の優先表示状況を確認
    const { data: priorityPosts, error: queryError } = await supabase
      .from('posts')
      .select('id, title, is_priority, priority_expires_at')
      .eq('is_priority', true)

    if (queryError) {
      console.error('優先表示投稿取得エラー:', queryError)
    }

    const result = {
      success: true,
      expired_count: data || 0,
      active_priority_posts: priorityPosts?.length || 0,
      timestamp: new Date().toISOString()
    }

    console.log('期限切れ処理完了:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('期限切れ処理エラー:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})