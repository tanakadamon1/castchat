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
  const defaultConfig = {
    title: 'castChat - VRChatキャスト募集',
    description: 'VRChatでのキャスト募集・参加者募集を効率的に行えるプラットフォーム。写真撮影、動画制作、イベント開催などの企画に最適なキャストを見つけよう。',
    keywords: ['VRChat', 'キャスト募集', 'VR', 'バーチャル', '写真撮影', '動画制作', 'イベント', '募集', '参加者'],
    ogTitle: config.title || 'castChat - VRChatキャスト募集',
    ogDescription: config.description || 'VRChatでのキャスト募集・参加者募集を効率的に行えるプラットフォーム',
    ogImage: config.ogImage || '/og-image.png',
    ogUrl: config.ogUrl || 'https://castchat.jp',
    twitterCard: config.twitterCard || 'summary_large_image',
    twitterTitle: config.twitterTitle || config.title || 'castChat - VRChatキャスト募集',
    twitterDescription: config.twitterDescription || config.description || 'VRChatでのキャスト募集・参加者募集プラットフォーム',
    twitterImage: config.twitterImage || config.ogImage || '/og-image.png',
  }

  const finalConfig = { ...defaultConfig, ...config }

  const head = useHead({
    title: finalConfig.title,
    meta: [
      {
        name: 'description',
        content: finalConfig.description,
      },
      {
        name: 'keywords',
        content: finalConfig.keywords?.join(', ') || '',
      },
      // Open Graph
      {
        property: 'og:title',
        content: finalConfig.ogTitle,
      },
      {
        property: 'og:description',
        content: finalConfig.ogDescription,
      },
      {
        property: 'og:image',
        content: finalConfig.ogImage,
      },
      {
        property: 'og:url',
        content: finalConfig.ogUrl,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'castChat',
      },
      // Twitter Card
      {
        name: 'twitter:card',
        content: finalConfig.twitterCard,
      },
      {
        name: 'twitter:title',
        content: finalConfig.twitterTitle,
      },
      {
        name: 'twitter:description',
        content: finalConfig.twitterDescription,
      },
      {
        name: 'twitter:image',
        content: finalConfig.twitterImage,
      },
    ],
    link: finalConfig.canonicalUrl
      ? [
          {
            rel: 'canonical',
            href: finalConfig.canonicalUrl,
          },
        ]
      : [],
  })

  return {
    head,
    // 無限ループを防ぐため、updateSEO を削除
  }
}