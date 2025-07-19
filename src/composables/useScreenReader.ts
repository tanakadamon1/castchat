import { ref } from 'vue'

export interface ScreenReaderOptions {
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all'
}

// グローバルな状態管理（Vue reactivity の外側）
const globalState = {
  recentMessages: new Set<string>(),
  messageCleanupTimeout: null as number | null,
  announcements: [] as string[]
}

export function useScreenReader() {
  // Vue reactivity を使わない、プレーンな配列で状態管理
  const announcements = ref<string[]>([...globalState.announcements])

  // ライブリージョンを作成または取得
  const createLiveRegion = (
    id: string,
    options: ScreenReaderOptions = {}
  ): HTMLElement => {
    const {
      politeness = 'polite',
      atomic = true,
      relevant = 'all'
    } = options

    let liveRegion = document.getElementById(id)
    
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = id
      liveRegion.setAttribute('aria-live', politeness)
      liveRegion.setAttribute('aria-atomic', atomic.toString())
      liveRegion.setAttribute('aria-relevant', relevant)
      liveRegion.className = 'sr-only'
      liveRegion.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `
      document.body.appendChild(liveRegion)
    }

    return liveRegion
  }

  // メッセージをアナウンス
  const announce = (
    message: string,
    options: ScreenReaderOptions = {}
  ) => {
    if (!message.trim()) return

    // 同じメッセージが最近送信された場合は無視（無限ループ防止）
    if (globalState.recentMessages.has(message)) {
      return
    }

    globalState.recentMessages.add(message)
    
    // 3秒後にメッセージを重複チェックリストから削除
    if (globalState.messageCleanupTimeout) {
      clearTimeout(globalState.messageCleanupTimeout)
    }
    globalState.messageCleanupTimeout = window.setTimeout(() => {
      globalState.recentMessages.clear()
    }, 3000)

    try {
      const liveRegion = createLiveRegion('global-announcer', options)
      
      // 前回のメッセージをクリア
      liveRegion.textContent = ''
      
      // 少し遅延させてからメッセージを設定（スクリーンリーダーの確実な読み上げのため）
      setTimeout(() => {
        liveRegion.textContent = message
        
        // グローバル状態に直接追加（Vue reactivity の外側）
        globalState.announcements.push(message)
        
        // 古いアナウンスを削除（最新50件のみ保持）
        if (globalState.announcements.length > 50) {
          globalState.announcements = globalState.announcements.slice(-50)
        }
        
        // Vue の state は更新しない（無限ループを防ぐため）
      }, 100)
    } catch (error) {
      console.warn('Screen reader announce error:', error)
    }
  }

  // 緊急メッセージのアナウンス
  const announceUrgent = (message: string) => {
    announce(message, { politeness: 'assertive' })
  }

  // ページ読み込み完了の通知
  const announcePageLoad = (title: string, description?: string) => {
    const message = description 
      ? `${title}ページが読み込まれました。${description}`
      : `${title}ページが読み込まれました。`
    
    // ページ読み込み時は少し遅延
    setTimeout(() => {
      announce(message)
    }, 1000)
  }

  // フォーム検証エラーの通知
  const announceFormError = (fieldName: string, errorMessage: string) => {
    announceUrgent(`${fieldName}でエラーが発生しました: ${errorMessage}`)
  }

  // 操作完了の通知
  const announceSuccess = (message: string) => {
    announce(`成功: ${message}`)
  }

  // 操作失敗の通知
  const announceError = (message: string) => {
    announceUrgent(`エラー: ${message}`)
  }

  // ローディング状態の通知
  const announceLoading = (action: string) => {
    announce(`${action}を読み込んでいます...`)
  }

  // ローディング完了の通知
  const announceLoadComplete = (action: string, count?: number) => {
    const message = count !== undefined
      ? `${action}が完了しました。${count}件の結果があります。`
      : `${action}が完了しました。`
    
    announce(message)
  }

  // リスト/テーブルの行数通知
  const announceListInfo = (totalItems: number, itemType: string = 'アイテム') => {
    if (totalItems === 0) {
      announce(`${itemType}がありません`)
    } else {
      announce(`${totalItems}件の${itemType}があります`)
    }
  }

  // ナビゲーション情報の通知
  const announceNavigation = (currentPage: number, totalPages: number) => {
    announce(`${totalPages}ページ中の${currentPage}ページ目`)
  }

  // 動的コンテンツ更新の通知
  const announceContentUpdate = (updateType: string, details?: string) => {
    const message = details
      ? `${updateType}が更新されました: ${details}`
      : `${updateType}が更新されました`
    
    announce(message)
  }

  // フォーカス移動の説明
  const announceKeyboardHelp = (context: string) => {
    const helpMessages = {
      'list': '矢印キーで項目を移動、Enterで選択、スペースで詳細表示',
      'modal': 'Escapeで閉じる、Tabでフォーカス移動',
      'form': 'Tabで次の項目、Shift+Tabで前の項目',
      'menu': '矢印キーでメニュー移動、Enterで選択、Escapeで閉じる',
      'default': 'Tabキーでナビゲーション、Enterで選択'
    }
    
    const message = helpMessages[context as keyof typeof helpMessages] || helpMessages.default
    announce(`キーボード操作: ${message}`)
  }

  // ARIA属性の動的設定
  const setAriaAttributes = (
    element: HTMLElement,
    attributes: Record<string, string | boolean | number>
  ) => {
    Object.entries(attributes).forEach(([key, value]) => {
      const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`
      element.setAttribute(ariaKey, String(value))
    })
  }

  // 要素の説明文生成
  const generateDescription = (element: HTMLElement): string => {
    const role = element.getAttribute('role') || element.tagName.toLowerCase()
    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('title') ||
                  element.textContent?.trim() || ''
    
    const state = []
    
    if (element.hasAttribute('aria-expanded')) {
      const expanded = element.getAttribute('aria-expanded') === 'true'
      state.push(expanded ? '展開済み' : '折りたたみ済み')
    }
    
    if (element.hasAttribute('aria-selected')) {
      const selected = element.getAttribute('aria-selected') === 'true'
      state.push(selected ? '選択済み' : '未選択')
    }
    
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
      state.push('無効')
    }
    
    const stateText = state.length > 0 ? `, ${state.join(', ')}` : ''
    
    return `${label}, ${role}${stateText}`
  }

  return {
    announcements,
    announce,
    announceUrgent,
    announcePageLoad,
    announceFormError,
    announceSuccess,
    announceError,
    announceLoading,
    announceLoadComplete,
    announceListInfo,
    announceNavigation,
    announceContentUpdate,
    announceKeyboardHelp,
    setAriaAttributes,
    generateDescription,
    createLiveRegion
  }
}

// グローバルなアナウンサー
let globalScreenReader: ReturnType<typeof useScreenReader> | null = null

export function getGlobalScreenReader() {
  if (!globalScreenReader) {
    globalScreenReader = useScreenReader()
  }
  return globalScreenReader
}