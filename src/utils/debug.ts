// デバッグ用ユーティリティ（開発環境でのみ使用）

export const clearAllStorageAndReload = async () => {
  // 本番環境では実行しない
  if (import.meta.env.PROD) {
    console.warn('Debug utilities are disabled in production')
    return
  }
  console.log('=== Clearing all storage and ServiceWorker ===')
  
  try {
    // 1. LocalStorageをクリア
    localStorage.clear()
    console.log('LocalStorage cleared')
    
    // 2. SessionStorageをクリア
    sessionStorage.clear()
    console.log('SessionStorage cleared')
    
    // 3. IndexedDBをクリア
    const databases = await indexedDB.databases()
    for (const db of databases) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name)
        console.log(`IndexedDB ${db.name} deleted`)
      }
    }
    
    // 4. ServiceWorkerをアンインストール
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        console.log('ServiceWorker unregistered')
      }
    }
    
    // 5. キャッシュをクリア
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName)
        console.log(`Cache ${cacheName} deleted`)
      }
    }
    
    console.log('All storage cleared successfully')
    
    // 6. ページをリロード
    setTimeout(() => {
      window.location.reload()
    }, 500)
    
  } catch (error) {
    console.error('Error clearing storage:', error)
  }
}

// グローバルに公開（デバッグ用）
if (typeof window !== 'undefined') {
  (window as any).clearAllStorageAndReload = clearAllStorageAndReload
}