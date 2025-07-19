import { useHead } from '@vueuse/head'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  twitterCard?: 'summary' | 'summary_large_image'
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonicalUrl?: string
}

export function useSEO(config: SEOConfig = {}) {
  // キーワードを事前に文字列として定義（反応性システムの影響を避ける）
  const defaultKeywords = 'VRChat, キャスト募集, VR, バーチャル, 写真撮影, 動画制作, イベント, 募集, 参加者'
  
  // 設定からキーワード文字列を生成（配列操作を避ける）
  let keywordsString = defaultKeywords
  if (config.keywords && Array.isArray(config.keywords)) {
    let customKeywords = ''
    for (let i = 0; i < config.keywords.length; i++) {
      if (i > 0) customKeywords += ', '
      customKeywords += config.keywords[i]
    }
    keywordsString = customKeywords
  }

  const finalConfig = {
    title: config.title || 'castChat - VRChatキャスト募集',
    description: config.description || 'VRChatでのキャスト募集・参加者募集を効率的に行えるプラットフォーム。写真撮影、動画制作、イベント開催などの企画に最適なキャストを見つけよう。',
    ogTitle: config.ogTitle || config.title || 'castChat - VRChatキャスト募集',
    ogDescription: config.ogDescription || config.description || 'VRChatでのキャスト募集・参加者募集を効率的に行えるプラットフォーム',
    ogImage: config.ogImage || '/og-image.png',
    ogUrl: config.ogUrl || 'https://castchat.jp',
    twitterCard: config.twitterCard || 'summary_large_image',
    twitterTitle: config.twitterTitle || config.title || 'castChat - VRChatキャスト募集',
    twitterDescription: config.twitterDescription || config.description || 'VRChatでのキャスト募集・参加者募集プラットフォーム',
    twitterImage: config.twitterImage || config.ogImage || '/og-image.png',
  }
  
  // 配列操作を避けるため、必要最小限のヘッド設定
  const headConfig: any = {
    title: finalConfig.title,
    meta: {},
  }

  // meta を個別に追加（配列を避ける）
  if (finalConfig.description) {
    headConfig.meta['description'] = finalConfig.description
  }
  if (keywordsString) {
    headConfig.meta['keywords'] = keywordsString
  }
  if (finalConfig.ogTitle) {
    headConfig.meta['og:title'] = finalConfig.ogTitle
  }
  if (finalConfig.ogDescription) {
    headConfig.meta['og:description'] = finalConfig.ogDescription
  }
  if (finalConfig.ogImage) {
    headConfig.meta['og:image'] = finalConfig.ogImage
  }
  if (finalConfig.ogUrl) {
    headConfig.meta['og:url'] = finalConfig.ogUrl
  }
  headConfig.meta['og:type'] = 'website'
  headConfig.meta['og:site_name'] = 'castChat'
  
  if (finalConfig.twitterCard) {
    headConfig.meta['twitter:card'] = finalConfig.twitterCard
  }
  if (finalConfig.twitterTitle) {
    headConfig.meta['twitter:title'] = finalConfig.twitterTitle
  }
  if (finalConfig.twitterDescription) {
    headConfig.meta['twitter:description'] = finalConfig.twitterDescription
  }
  if (finalConfig.twitterImage) {
    headConfig.meta['twitter:image'] = finalConfig.twitterImage
  }

  // canonical URL も個別に設定
  if (finalConfig.canonicalUrl) {
    headConfig.link = {
      'canonical': finalConfig.canonicalUrl
    }
  }

  const head = useHead(headConfig)

  return {
    head,
    // 無限ループを防ぐため、updateSEO を削除
  }
}
