// Edge Function for sending notifications
// supabase/functions/send-notification/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationData {
  userId: string
  type: string
  title: string
  message: string
  relatedId?: string
  relatedType?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, type, title, message, relatedId, relatedType, priority = 'normal' }: NotificationData = await req.json()
    
    // Supabaseクライアント初期化
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // 1. データベースに通知を保存
    const { data: notification, error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        related_id: relatedId,
        related_type: relatedType,
        priority
      })
      .select()
      .single()
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }
    
    // 2. ユーザーの通知設定を取得
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('email, email_notifications, push_notifications, preferred_contact')
      .eq('user_id', userId)
      .single()
    
    if (userError) {
      console.warn(`Could not fetch user profile: ${userError.message}`)
    }
    
    const results = {
      notification_id: notification.id,
      email_sent: false,
      push_sent: false,
      errors: [] as string[]
    }
    
    // 3. メール通知送信
    if (userProfile?.email && userProfile.email_notifications) {
      try {
        const emailTemplate = generateEmailTemplate(type, { title, message, relatedId, relatedType })
        const emailSent = await sendEmail(userProfile.email, emailTemplate)
        results.email_sent = emailSent
      } catch (emailError) {
        results.errors.push(`Email error: ${emailError.message}`)
      }
    }
    
    // 4. プッシュ通知送信
    if (userProfile?.push_notifications) {
      try {
        const pushSent = await sendPushNotification(userId, { title, message, type })
        results.push_sent = pushSent
      } catch (pushError) {
        results.errors.push(`Push error: ${pushError.message}`)
      }
    }
    
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Notification function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// メールテンプレート生成
function generateEmailTemplate(type: string, data: any): EmailTemplate {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://castchat.jp'
  
  switch (type) {
    case 'application_received':
      return {
        subject: '【CastChat】新しい応募が届きました',
        html: `
          <h2>新しい応募が届きました</h2>
          <p>${data.message}</p>
          <p><a href="${baseUrl}/posts/${data.relatedId}/applications" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">応募を確認する</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">このメールはCastChatからの自動送信です。</p>
        `,
        text: `新しい応募が届きました\n\n${data.message}\n\n応募を確認: ${baseUrl}/posts/${data.relatedId}/applications`
      }
      
    case 'application_accepted':
      return {
        subject: '【CastChat】応募が承認されました',
        html: `
          <h2>応募が承認されました！</h2>
          <p>${data.message}</p>
          <p><a href="${baseUrl}/profile/applications" style="background: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">応募履歴を確認する</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">このメールはCastChatからの自動送信です。</p>
        `,
        text: `応募が承認されました！\n\n${data.message}\n\n応募履歴: ${baseUrl}/profile/applications`
      }
      
    case 'application_rejected':
      return {
        subject: '【CastChat】応募結果のお知らせ',
        html: `
          <h2>応募結果のお知らせ</h2>
          <p>${data.message}</p>
          <p>今回は残念な結果となりましたが、またの機会をお待ちしています。</p>
          <p><a href="${baseUrl}/posts" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">他の募集を見る</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">このメールはCastChatからの自動送信です。</p>
        `,
        text: `応募結果のお知らせ\n\n${data.message}\n\n他の募集を見る: ${baseUrl}/posts`
      }
      
    default:
      return {
        subject: `【CastChat】${data.title}`,
        html: `
          <h2>${data.title}</h2>
          <p>${data.message}</p>
          <p><a href="${baseUrl}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">CastChatを開く</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">このメールはCastChatからの自動送信です。</p>
        `,
        text: `${data.title}\n\n${data.message}\n\nCastChat: ${baseUrl}`
      }
  }
}

// メール送信（SendGrid使用）
async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
  if (!sendGridApiKey) {
    throw new Error('SendGrid API key not configured')
  }
  
  const response = await fetch('https://api.sendgrid.v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendGridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
        subject: template.subject,
      }],
      from: { 
        email: Deno.env.get('FROM_EMAIL') || 'noreply@castchat.jp', 
        name: 'CastChat' 
      },
      content: [
        {
          type: 'text/html',
          value: template.html
        },
        {
          type: 'text/plain',
          value: template.text
        }
      ]
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`SendGrid error: ${response.status} ${errorText}`)
  }
  
  return true
}

// プッシュ通知送信
async function sendPushNotification(userId: string, data: { title: string, message: string, type: string }): Promise<boolean> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // ユーザーのプッシュ通知購読情報を取得
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)
  
  if (error || !subscriptions || subscriptions.length === 0) {
    throw new Error('No push subscriptions found')
  }
  
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
  
  if (!vapidPrivateKey || !vapidPublicKey) {
    throw new Error('VAPID keys not configured')
  }
  
  // Web Push送信（簡略化版 - 実際の実装ではweb-pushライブラリを使用）
  const payload = JSON.stringify({
    title: data.title,
    body: data.message,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      type: data.type,
      url: '/'
    }
  })
  
  let sent = false
  for (const sub of subscriptions) {
    try {
      // 実際の実装では、web-pushライブラリを使用してプッシュ通知を送信
      // ここでは簡略化してtrueを返す
      console.log(`Would send push notification to subscription: ${JSON.stringify(sub.subscription)}`)
      console.log(`Payload: ${payload}`)
      sent = true
    } catch (pushError) {
      console.error('Push notification error:', pushError)
    }
  }
  
  return sent
}

// Webhook for email events
export async function handleEmailWebhook(req: Request): Promise<Response> {
  try {
    const events = await req.json()
    
    for (const event of events) {
      // SendGridからのイベント処理（配信、開封、クリックなど）
      console.log(`Email event: ${event.event} for ${event.email}`)
      
      // 必要に応じてデータベースに記録
      if (event.event === 'delivered' || event.event === 'opened') {
        // 統計情報更新など
      }
    }
    
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Email webhook error:', error)
    return new Response('Error', { status: 500 })
  }
}