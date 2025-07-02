import { ref, onMounted, onUnmounted } from 'vue'

export interface OfflineQueueItem {
  id: string
  action: string
  data: any
  timestamp: number
  retryCount: number
}

export function useOffline() {
  const isOnline = ref(navigator.onLine)
  const offlineQueue = ref<OfflineQueueItem[]>([])
  const syncStatus = ref<'idle' | 'syncing' | 'error'>('idle')

  // オンライン状態の監視
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
    
    if (isOnline.value && offlineQueue.value.length > 0) {
      syncOfflineQueue()
    }
  }

  // オフラインキューに追加
  const addToOfflineQueue = (action: string, data: any): string => {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const item: OfflineQueueItem = {
      id,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0
    }
    
    offlineQueue.value.push(item)
    saveOfflineQueue()
    
    return id
  }

  // オフラインキューから削除
  const removeFromOfflineQueue = (id: string) => {
    const index = offlineQueue.value.findIndex(item => item.id === id)
    if (index !== -1) {
      offlineQueue.value.splice(index, 1)
      saveOfflineQueue()
    }
  }

  // オフラインキューの同期
  const syncOfflineQueue = async () => {
    if (!isOnline.value || syncStatus.value === 'syncing') {
      return
    }
    
    syncStatus.value = 'syncing'
    
    const itemsToSync = [...offlineQueue.value]
    
    for (const item of itemsToSync) {
      try {
        await processOfflineItem(item)
        removeFromOfflineQueue(item.id)
      } catch (error) {
        console.error('Failed to sync offline item:', error)
        item.retryCount++
        
        // 3回失敗したら削除
        if (item.retryCount >= 3) {
          removeFromOfflineQueue(item.id)
        }
      }
    }
    
    syncStatus.value = offlineQueue.value.length === 0 ? 'idle' : 'error'
  }

  // オフライン項目の処理
  const processOfflineItem = async (item: OfflineQueueItem) => {
    const { action, data } = item
    
    switch (action) {
      case 'create_post':
        // 投稿作成の再実行
        const { postsApi } = await import('@/lib/postsApi')
        await postsApi.createPost(data)
        break
        
      case 'send_message':
        // メッセージ送信の再実行
        const { messageApi } = await import('@/lib/messageApi')
        await messageApi.sendMessage(data)
        break
        
      case 'apply_to_post':
        // 応募の再実行
        const { applicationApi } = await import('@/lib/applicationApi')
        await applicationApi.createApplication(data)
        break
        
      case 'update_profile':
        // プロフィール更新の再実行
        // TODO: プロフィールAPI実装時に追加
        break
        
      default:
        console.warn('Unknown offline action:', action)
    }
  }

  // ローカルストレージから読み込み
  const loadOfflineQueue = () => {
    try {
      const stored = localStorage.getItem('offline_queue')
      if (stored) {
        offlineQueue.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
      offlineQueue.value = []
    }
  }

  // ローカルストレージに保存
  const saveOfflineQueue = () => {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(offlineQueue.value))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  // オフライン対応のAPI呼び出しラッパー
  const offlineCapableRequest = async <T>(
    action: string,
    data: any,
    onlineHandler: () => Promise<T>
  ): Promise<T | null> => {
    if (isOnline.value) {
      try {
        return await onlineHandler()
      } catch (error) {
        // ネットワークエラーの場合はオフラインキューに追加
        if (error instanceof TypeError && error.message.includes('fetch')) {
          addToOfflineQueue(action, data)
          throw new Error('オフラインのため後で同期されます')
        }
        throw error
      }
    } else {
      // オフライン時は即座にキューに追加
      addToOfflineQueue(action, data)
      throw new Error('オフライン中です。オンラインになったら自動で同期されます')
    }
  }

  // キャッシュからデータを取得
  const getCachedData = async (key: string) => {
    try {
      const cache = await caches.open('app-cache')
      const response = await cache.match(key)
      
      if (response) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to get cached data:', error)
    }
    
    return null
  }

  // データをキャッシュに保存
  const setCachedData = async (key: string, data: any) => {
    try {
      const cache = await caches.open('app-cache')
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=86400' // 24時間
        }
      })
      
      await cache.put(key, response)
    } catch (error) {
      console.error('Failed to cache data:', error)
    }
  }

  onMounted(() => {
    loadOfflineQueue()
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // オンライン復帰時の同期
    if (isOnline.value && offlineQueue.value.length > 0) {
      syncOfflineQueue()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  })

  return {
    isOnline,
    offlineQueue,
    syncStatus,
    addToOfflineQueue,
    removeFromOfflineQueue,
    syncOfflineQueue,
    offlineCapableRequest,
    getCachedData,
    setCachedData
  }
}