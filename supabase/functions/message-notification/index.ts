// Edge Function: メッセージ通知システム
// supabase/functions/message-notification/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MessageNotificationData {
  messageId: string
  senderId: string
  recipientId: string
  content: string
  messageType: string
  senderName?: string
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

Deno.serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messageId, senderId, recipientId, content, messageType, senderName }: MessageNotificationData = await req.json()
    
    // Supabaseクライアント初期化
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    console.log(`Processing message notification: ${messageId}`)
    
    const results = {
      message_id: messageId,
      notification_created: false,
      email_sent: false,
      push_sent: false,
      errors: [] as string[]
    }

    // 1. データベース通知作成
    try {
      const { data: notification, error: dbError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'message_received',
          title: '新しいメッセージ',
          message: `${senderName || '匿名ユーザー'}からメッセージが届きました`,
          related_id: messageId,
          is_read: false
        })
        .select()
        .single()
      
      if (dbError) {
        throw new Error(`Database notification error: ${dbError.message}`)
      }
      
      results.notification_created = true
      console.log(`Database notification created: ${notification.id}`)
      
    } catch (error) {
      console.error('Database notification error:', error)
      results.errors.push(`Database notification: ${error.message}`)
    }

    // 2. 受信者の通知設定を取得
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('id, display_name, notification_settings')
      .eq('id', recipientId)
      .single()
    
    if (recipientError) {
      console.warn(`Could not fetch recipient: ${recipientError.message}`)
      results.errors.push(`Recipient fetch: ${recipientError.message}`)
    }

    const notificationSettings = recipient?.notification_settings || {}

    // 3. プッシュ通知送信
    if (notificationSettings.push_notifications !== false) {
      try {
        const pushResult = await sendPushNotification(
          supabase,
          recipientId,
          {
            title: '新しいメッセージ',
            body: messageType === 'text' 
              ? (content.length > 50 ? content.substring(0, 50) + '...' : content)
              : '画像が送信されました',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data: {
              type: 'message',
              messageId,
              senderId,
              url: `/messages/${senderId}`
            }
          }
        )
        
        results.push_sent = pushResult.success
        if (!pushResult.success) {
          results.errors.push(`Push notification: ${pushResult.error}`)
        }
        
      } catch (pushError) {
        console.error('Push notification error:', pushError)
        results.errors.push(`Push notification: ${pushError.message}`)
      }
    }

    // 4. メール通知送信（設定に応じて）
    if (notificationSettings.email_notifications === true) {
      try {
        const emailResult = await sendEmailNotification(
          recipientId,
          senderName || '匿名ユーザー',
          messageType === 'text' ? content : '画像メッセージ',
          messageId
        )
        
        results.email_sent = emailResult.success
        if (!emailResult.success) {
          results.errors.push(`Email notification: ${emailResult.error}`)
        }
        
      } catch (emailError) {
        console.error('Email notification error:', emailError)
        results.errors.push(`Email notification: ${emailError.message}`)
      }
    }

    // 5. リアルタイム通知（Supabase Realtime）
    try {
      // Realtimeチャンネルに通知送信
      await supabase
        .channel(`user-${recipientId}`)
        .send({
          type: 'broadcast',
          event: 'new_message',
          payload: {
            messageId,
            senderId,
            senderName,
            content: messageType === 'text' ? content : '[画像]',
            messageType,
            timestamp: new Date().toISOString()
          }
        })
      
      console.log(`Realtime notification sent to user-${recipientId}`)
      
    } catch (realtimeError) {
      console.error('Realtime notification error:', realtimeError)
      results.errors.push(`Realtime: ${realtimeError.message}`)
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Message notification function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// プッシュ通知送信関数
async function sendPushNotification(
  supabase: any,
  userId: string,
  payload: {
    title: string
    body: string
    icon: string
    badge: string
    data: any
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // ユーザーのプッシュ通知購読情報を取得
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (error || !subscriptions || subscriptions.length === 0) {
      return { success: false, error: 'No active push subscriptions found' }
    }

    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    
    if (!vapidPrivateKey || !vapidPublicKey) {
      return { success: false, error: 'VAPID keys not configured' }
    }

    let successCount = 0
    
    for (const sub of subscriptions) {
      try {
        // Web Push送信（簡略化版）
        console.log(`Sending push notification to: ${JSON.stringify(sub.subscription)}`)
        console.log(`Payload: ${JSON.stringify(payload)}`)
        
        // 実際の実装では web-push ライブラリを使用
        successCount++
        
      } catch (pushError) {
        console.error('Individual push notification error:', pushError)
      }
    }
    
    return { 
      success: successCount > 0,
      error: successCount === 0 ? 'All push notifications failed' : undefined
    }
    
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// メール通知送信関数
async function sendEmailNotification(
  recipientId: string,
  senderName: string,
  messageContent: string,
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    if (!sendGridApiKey) {
      return { success: false, error: 'SendGrid API key not configured' }
    }

    // 受信者のメールアドレス取得は実装に応じて調整
    const recipientEmail = `user-${recipientId}@example.com` // 仮実装
    
    const emailPayload = {
      personalizations: [{
        to: [{ email: recipientEmail }],
        subject: '【CastChat】新しいメッセージが届きました',
      }],
      from: { 
        email: Deno.env.get('FROM_EMAIL') || 'noreply@castchat.jp', 
        name: 'CastChat' 
      },
      content: [{
        type: 'text/html',
        value: `
          <h2>新しいメッセージが届きました</h2>
          <p><strong>送信者:</strong> ${senderName}</p>
          <p><strong>内容:</strong> ${messageContent}</p>
          <p><a href="${Deno.env.get('SITE_URL') || 'https://castchat.jp'}/messages" 
             style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             メッセージを確認する</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">このメールはCastChatからの自動送信です。</p>
        `
      }]
    }

    const response = await fetch('https://api.sendgrid.v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, error: `SendGrid error: ${response.status} ${errorText}` }
    }
    
    return { success: true }
    
  } catch (error) {
    return { success: false, error: error.message }
  }
}