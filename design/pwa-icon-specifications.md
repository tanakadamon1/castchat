# PWAアイコン仕様書

## CastChatロゴ・アイコンデザイン

### ブランドコンセプト
- **コンセプト**: VRChatコミュニティの「つながり」と「表現」
- **デザイン要素**: ヘッドセット + チャット吹き出し + ハート
- **カラー**: プライマリブルー (#3B82F6) + アクセントパープル (#A855F7)

### SVGマスターロゴ
```svg
<!-- CastChat メインロゴ -->
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景円 -->
  <circle cx="256" cy="256" r="256" fill="url(#gradient)"/>
  
  <!-- VRヘッドセット -->
  <path d="M256 160 Q200 160 160 200 L160 280 Q160 320 200 320 L312 320 Q352 320 352 280 L352 200 Q312 160 256 160 Z" fill="white"/>
  
  <!-- レンズ -->
  <circle cx="200" cy="240" r="35" fill="#1E40AF" opacity="0.8"/>
  <circle cx="312" cy="240" r="35" fill="#1E40AF" opacity="0.8"/>
  <circle cx="200" cy="240" r="20" fill="#60A5FA"/>
  <circle cx="312" cy="240" r="20" fill="#60A5FA"/>
  
  <!-- ストラップ -->
  <path d="M160 200 Q120 200 120 240 Q120 280 160 280" stroke="white" stroke-width="12" fill="none"/>
  <path d="M352 200 Q392 200 392 240 Q392 280 352 280" stroke="white" stroke-width="12" fill="none"/>
  
  <!-- チャット吹き出し -->
  <circle cx="350" cy="180" r="40" fill="#A855F7"/>
  <path d="M330 200 L340 210 L320 220 Z" fill="#A855F7"/>
  
  <!-- ハートアイコン -->
  <path d="M340 165 Q345 160 350 165 Q355 160 360 165 Q360 175 350 185 Q340 175 340 165 Z" fill="white"/>
  
  <!-- 音波 -->
  <path d="M280 200 Q290 190 300 200 Q290 210 280 220" stroke="#60A5FA" stroke-width="3" fill="none" opacity="0.6"/>
  <path d="M285 210 Q292 205 300 210 Q292 215 285 220" stroke="#60A5FA" stroke-width="2" fill="none" opacity="0.4"/>
  
  <!-- グラデーション定義 -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>
```

## PWAアイコンサイズ仕様

### 必須アイコンサイズ
- **512x512px**: PWA推奨最大サイズ
- **192x192px**: Android Chrome推奨
- **180x180px**: iOS Safari (apple-touch-icon)
- **32x32px**: ファビコン
- **16x16px**: ブラウザタブ

### ファイル命名規則
```
/public/icons/
├── icon-16x16.png
├── icon-32x32.png
├── icon-180x180.png (apple-touch-icon)
├── icon-192x192.png
├── icon-512x512.png
├── favicon.ico
└── maskable-icon-512x512.png
```

### Maskable Icon 仕様
```svg
<!-- Maskable Icon (セーフエリア考慮) -->
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- セーフエリア: 中央80%に重要要素配置 -->
  
  <!-- 背景（フルサイズ） -->
  <rect width="512" height="512" fill="url(#maskableGradient)"/>
  
  <!-- メインアイコン（セーフエリア内） -->
  <g transform="translate(102, 102) scale(0.6)">
    <!-- 上記のメインロゴをセーフエリア内に配置 -->
    <circle cx="256" cy="256" r="256" fill="white" opacity="0.1"/>
    <!-- VRヘッドセット（簡略化） -->
    <rect x="180" y="200" width="152" height="80" rx="40" fill="white"/>
    <circle cx="220" cy="240" r="25" fill="#1E40AF"/>
    <circle cx="292" cy="240" r="25" fill="#1E40AF"/>
    <!-- チャット吹き出し -->
    <circle cx="350" cy="180" r="30" fill="#A855F7"/>
    <path d="M325 195 L335 205 L320 210 Z" fill="#A855F7"/>
  </g>
  
  <!-- グラデーション -->
  <defs>
    <linearGradient id="maskableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>
```

## manifest.webmanifest 更新仕様

```json
{
  "name": "VRChatキャスト募集掲示板",
  "short_name": "CastChat",
  "description": "VRChatコミュニティのためのキャスト募集・応募プラットフォーム",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#3B82F6",
  "orientation": "portrait-primary",
  "categories": ["social", "entertainment", "lifestyle"],
  "lang": "ja",
  "dir": "ltr",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-180x180.png",
      "sizes": "180x180",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "ホーム画面（デスクトップ）"
    },
    {
      "src": "/screenshots/mobile-posts.png", 
      "sizes": "375x812",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "募集一覧（モバイル）"
    }
  ],
  "shortcuts": [
    {
      "name": "新規投稿",
      "short_name": "投稿",
      "description": "新しい募集を投稿する",
      "url": "/posts/create",
      "icons": [
        {
          "src": "/icons/shortcut-create.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "応募履歴",
      "short_name": "履歴", 
      "description": "応募履歴を確認する",
      "url": "/applications",
      "icons": [
        {
          "src": "/icons/shortcut-applications.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
```

## ショートカットアイコン仕様

### shortcut-create.png (96x96px)
```svg
<svg width="96" height="96" viewBox="0 0 96 96" fill="none">
  <rect width="96" height="96" rx="20" fill="#10B981"/>
  <path d="M48 24 V72 M24 48 H72" stroke="white" stroke-width="6" stroke-linecap="round"/>
</svg>
```

### shortcut-applications.png (96x96px)  
```svg
<svg width="96" height="96" viewBox="0 0 96 96" fill="none">
  <rect width="96" height="96" rx="20" fill="#8B5CF6"/>
  <rect x="24" y="20" width="48" height="56" rx="4" fill="white"/>
  <rect x="30" y="32" width="36" height="3" fill="#8B5CF6"/>
  <rect x="30" y="40" width="30" height="3" fill="#8B5CF6"/>
  <rect x="30" y="48" width="24" height="3" fill="#8B5CF6"/>
  <circle cx="66" cy="66" r="8" fill="#10B981"/>
  <path d="M63 66 L65 68 L69 64" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
```

## HTML meta タグ更新

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <!-- 既存のmeta要素 -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- PWA関連 -->
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="theme-color" content="#3B82F6" />
  <meta name="background-color" content="#FFFFFF" />
  
  <!-- アイコン -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
  
  <!-- iOS対応 -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="CastChat" />
  
  <!-- OGP -->
  <meta property="og:title" content="VRChatキャスト募集掲示板 - CastChat" />
  <meta property="og:description" content="VRChatコミュニティのためのキャスト募集・応募プラットフォーム" />
  <meta property="og:image" content="/icons/icon-512x512.png" />
  <meta property="og:url" content="https://castchat.jp" />
  <meta property="og:type" content="website" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="VRChatキャスト募集掲示板 - CastChat" />
  <meta name="twitter:description" content="VRChatコミュニティのためのキャスト募集・応募プラットフォーム" />
  <meta name="twitter:image" content="/icons/icon-512x512.png" />
  
  <title>VRChatキャスト募集掲示板 - CastChat</title>
</head>
```

## 画像生成用のCSS（SVGからPNG変換用）

```css
/* アイコン生成用CSS */
.icon-container {
  width: 512px;
  height: 512px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  border-radius: 0; /* 角丸なし、マスク処理で対応 */
}

.icon-container.rounded {
  border-radius: 20%; /* iOS用 */
}

.icon-container.circular {
  border-radius: 50%; /* Android用オプション */
}

/* レスポンシブ対応（ブラウザ表示用） */
.favicon {
  width: 16px;
  height: 16px;
}

.apple-touch-icon {
  width: 180px;
  height: 180px;
  border-radius: 20px;
}

.pwa-icon {
  width: 192px;
  height: 192px;
}
```

## 実装チェックリスト

### 必須ファイル作成
- [ ] `/public/icons/icon-16x16.png`
- [ ] `/public/icons/icon-32x32.png`
- [ ] `/public/icons/icon-180x180.png`
- [ ] `/public/icons/icon-192x192.png`
- [ ] `/public/icons/icon-512x512.png`
- [ ] `/public/icons/maskable-icon-512x512.png`
- [ ] `/public/favicon.ico`
- [ ] `/public/manifest.webmanifest`

### ショートカットアイコン
- [ ] `/public/icons/shortcut-create.png`
- [ ] `/public/icons/shortcut-applications.png`

### HTML更新
- [ ] `index.html` - meta tags追加
- [ ] manifest.webmanifest リンク追加
- [ ] theme-color設定

### テスト項目
- [ ] PWA installability (Chrome DevTools)
- [ ] iOS Safari bookmark icon確認
- [ ] Android Chrome icon確認
- [ ] アクセシビリティ確認

この仕様に基づいてPWAアイコンセットを実装することで、ユーザーがCastChatを端末にインストールした際に、統一感のある美しいアイコンが表示されます。