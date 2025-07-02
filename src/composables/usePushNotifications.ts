import { ref, onMounted } from 'vue'

export interface NotificationPermission {
  state: 'default' | 'granted' | 'denied'
  canRequest: boolean
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function usePushNotifications() {
  const permission = ref<NotificationPermission>({
    state: 'default',
    canRequest: true
  })
  const subscription = ref<PushSubscription | null>(null)
  const isSupported = ref(false)

  // プッシュ通知のサポート確認
  const checkSupport = () => {
    isSupported.value = 
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    
    if (isSupported.value) {
      permission.value.state = Notification.permission
      permission.value.canRequest = Notification.permission === 'default'
    }
  }

  // 通知権限のリクエスト
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      throw new Error('プッシュ通知はサポートされていません')
    }

    if (permission.value.state === 'granted') {
      return true
    }

    if (permission.value.state === 'denied') {
      throw new Error('通知権限が拒否されています。ブラウザ設定から有効にしてください')
    }

    try {
      const result = await Notification.requestPermission()
      permission.value.state = result
      permission.value.canRequest = result === 'default'
      
      return result === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      throw new Error('通知権限のリクエストに失敗しました')
    }
  }

  // プッシュ通知の購読
  const subscribe = async (): Promise<PushSubscription> => {
    if (!isSupported.value) {
      throw new Error('プッシュ通知はサポートされていません')
    }

    if (permission.value.state !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        throw new Error('通知権限が必要です')
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready
      
      // VAPID公開キー（実際の実装では環境変数から取得）
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
        'BMqSvZjS7-5KG9-n-4Tm9d1O4cAyv4nX3QV8Dqf2uE8K8-example-key'
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      // サブスクリプション情報を整形
      const subscriptionData: PushSubscription = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
        }
      }

      subscription.value = subscriptionData
      
      // サーバーに登録
      await registerSubscription(subscriptionData)
      
      return subscriptionData
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      throw new Error('プッシュ通知の購読に失敗しました')
    }
  }

  // プッシュ通知の購読解除
  const unsubscribe = async (): Promise<void> => {
    try {
      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.getSubscription()
      
      if (pushSubscription) {
        await pushSubscription.unsubscribe()
        subscription.value = null
        
        // サーバーから削除
        await unregisterSubscription()
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      throw new Error('プッシュ通知の購読解除に失敗しました')
    }
  }

  // サーバーにサブスクリプションを登録
  const registerSubscription = async (subscriptionData: PushSubscription) => {
    try {
      // TODO: 実際のAPIエンドポイントに送信
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(subscriptionData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to register subscription')
      }
    } catch (error) {
      console.error('Failed to register subscription on server:', error)
      // サーバー登録に失敗してもクライアント側の購読は有効にしておく
    }
  }

  // サーバーからサブスクリプションを削除
  const unregisterSubscription = async () => {
    try {
      // TODO: 実際のAPIエンドポイントから削除
      await fetch('/api/push/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
    } catch (error) {
      console.error('Failed to unregister subscription on server:', error)
    }
  }

  // ローカル通知の表示
  const showLocalNotification = (
    title: string,
    options: NotificationOptions = {}
  ) => {
    if (permission.value.state !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    }

    return new Notification(title, defaultOptions)
  }

  // メッセージ通知
  const notifyNewMessage = (senderName: string, message: string) => {
    return showLocalNotification(`${senderName}からメッセージ`, {
      body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      tag: 'new-message',
      renotify: true,
      actions: [
        {
          action: 'reply',
          title: '返信'
        },
        {
          action: 'view',
          title: '表示'
        }
      ]
    })
  }

  // 応募通知
  const notifyNewApplication = (postTitle: string, applicantName: string) => {
    return showLocalNotification('新しい応募があります', {
      body: `${applicantName}さんが「${postTitle}」に応募しました`,
      tag: 'new-application',
      actions: [
        {
          action: 'view',
          title: '確認'
        },
        {
          action: 'ignore',
          title: '後で'
        }
      ]
    })
  }

  // システム通知
  const notifySystem = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    const icons = {
      info: '/icons/info.png',
      warning: '/icons/warning.png',
      error: '/icons/error.png'
    }

    return showLocalNotification('システム通知', {
      body: message,
      icon: icons[type],
      tag: `system-${type}`
    })
  }

  // 現在のサブスクリプション状態を確認
  const checkSubscription = async () => {
    if (!isSupported.value) return

    try {
      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.getSubscription()
      
      if (pushSubscription) {
        subscription.value = {
          endpoint: pushSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
          }
        }
      }
    } catch (error) {
      console.error('Failed to check subscription:', error)
    }
  }

  // ユーティリティ関数
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach((b) => binary += String.fromCharCode(b))
    return window.btoa(binary)
  }

  const getAuthToken = (): string => {
    // TODO: 実際の認証トークンを取得
    return 'mock-token'
  }

  onMounted(() => {
    checkSupport()
    checkSubscription()
  })

  return {
    permission,
    subscription,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification,
    notifyNewMessage,
    notifyNewApplication,
    notifySystem,
    checkSubscription
  }
}