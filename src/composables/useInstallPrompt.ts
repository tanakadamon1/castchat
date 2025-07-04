import { ref, onMounted, onUnmounted } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const showPrompt = ref(false)
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)

  // インストール可能性の確認
  const checkInstallability = () => {
    // 既にインストール済みかチェック
    if (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true) {
      isInstalled.value = true
      return
    }

    // PWAとして表示されているかチェック
    if (document.referrer.includes('android-app://')) {
      isInstalled.value = true
      return
    }
  }

  // インストールプロンプトの表示
  const showInstallPrompt = async (): Promise<boolean> => {
    if (!deferredPrompt.value) {
      throw new Error('インストールプロンプトが利用できません')
    }

    try {
      // プロンプトを表示
      await deferredPrompt.value.prompt()
      
      // ユーザーの選択を待つ
      const { outcome } = await deferredPrompt.value.userChoice
      
      // プロンプトを使用済みにする
      deferredPrompt.value = null
      isInstallable.value = false
      
      if (outcome === 'accepted') {
        isInstalled.value = true
        hideInstallPrompt()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to show install prompt:', error)
      throw new Error('インストールプロンプトの表示に失敗しました')
    }
  }

  // カスタムプロンプトの表示
  const showCustomPrompt = () => {
    showPrompt.value = true
  }

  // カスタムプロンプトの非表示
  const hideInstallPrompt = () => {
    showPrompt.value = false
  }

  // プロンプトの延期
  const dismissPrompt = () => {
    hideInstallPrompt()
    
    // 1週間後まで表示しない
    const dismissedUntil = Date.now() + (7 * 24 * 60 * 60 * 1000)
    localStorage.setItem('install-prompt-dismissed', dismissedUntil.toString())
  }

  // 延期期間の確認
  const isDismissed = (): boolean => {
    const dismissedUntil = localStorage.getItem('install-prompt-dismissed')
    if (!dismissedUntil) return false
    
    return Date.now() < parseInt(dismissedUntil)
  }

  // インストール条件の確認
  const checkInstallConditions = (): boolean => {
    // 既にインストール済み
    if (isInstalled.value) return false
    
    // インストール不可能
    if (!isInstallable.value) return false
    
    // 延期期間中
    if (isDismissed()) return false
    
    // 訪問回数が少ない（最低3回の訪問が必要）
    const visitCount = parseInt(localStorage.getItem('visit-count') || '0')
    if (visitCount < 3) return false
    
    // 最初の訪問から一定時間経過していない（24時間）
    const firstVisit = localStorage.getItem('first-visit')
    if (firstVisit) {
      const timeSinceFirstVisit = Date.now() - parseInt(firstVisit)
      if (timeSinceFirstVisit < 24 * 60 * 60 * 1000) return false
    }
    
    return true
  }

  // 訪問回数の更新
  const updateVisitCount = () => {
    const visitCount = parseInt(localStorage.getItem('visit-count') || '0')
    localStorage.setItem('visit-count', (visitCount + 1).toString())
    
    // 初回訪問の記録
    if (!localStorage.getItem('first-visit')) {
      localStorage.setItem('first-visit', Date.now().toString())
    }
  }

  // インストール後の処理
  const handleAppInstalled = () => {
    isInstalled.value = true
    isInstallable.value = false
    hideInstallPrompt()
    
    // インストール完了を記録
    localStorage.setItem('app-installed', 'true')
    
    // 分析イベントの送信（実装時）
    // analytics.track('app_installed')
  }

  // PWA機能の確認
  const checkPWAFeatures = () => {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      badging: 'setAppBadge' in navigator,
      sharing: 'share' in navigator
    }
  }

  // アプリのメタデータ取得
  const getAppMetadata = () => {
    const manifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
    
    return {
      name: 'VRChatキャスト募集掲示板',
      shortName: 'キャスト募集',
      description: 'VRChatでのキャスト募集・応募プラットフォーム',
      manifestUrl: manifest?.href,
      features: checkPWAFeatures()
    }
  }

  // ネイティブ共有
  const shareApp = async () => {
    const metadata = getAppMetadata()
    
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: metadata.name,
          text: metadata.description,
          url: window.location.href
        })
      } catch (error) {
        console.error('Failed to share:', error)
        // フォールバック: クリップボードにコピー
        await (navigator as any).clipboard.writeText(window.location.href)
        throw new Error('URLをクリップボードにコピーしました')
      }
    } else {
      // Web Share API未対応の場合はクリップボードにコピー
      await (navigator as any).clipboard.writeText(window.location.href)
      throw new Error('URLをクリップボードにコピーしました')
    }
  }

  // beforeinstallpromptイベントのハンドリング
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent
    isInstallable.value = true
    
    // 条件を満たす場合は自動でプロンプトを表示
    if (checkInstallConditions()) {
      setTimeout(() => {
        showCustomPrompt()
      }, 3000) // 3秒後に表示
    }
  }

  // appinstalledイベントのハンドリング
  const handleAppInstalledEvent = () => {
    handleAppInstalled()
  }

  onMounted(() => {
    checkInstallability()
    updateVisitCount()
    
    // イベントリスナーの追加
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalledEvent)
    
    // 既存のプロンプトが利用可能かチェック
    const existingPrompt = (window as any).deferredPrompt
    if (existingPrompt) {
      deferredPrompt.value = existingPrompt
      isInstallable.value = true
    }
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalledEvent)
  })

  return {
    isInstallable,
    isInstalled,
    showPrompt,
    showInstallPrompt,
    showCustomPrompt,
    hideInstallPrompt,
    dismissPrompt,
    shareApp,
    getAppMetadata,
    checkPWAFeatures
  }
}