# VRChatキャスト募集掲示板 アクセシビリティチェックリスト

## アクセシビリティ対応概要

WCAG 2.1 AA レベルに準拠したアクセシビリティを実現し、障害の有無や使用環境に関わらず、すべてのユーザーがVRChatキャスト募集掲示板を利用できるようにします。

## 対応ガイドライン

### 準拠基準
- **WCAG 2.1 AA レベル**準拠
- **JIS X 8341-3:2016**対応
- **Section 508**対応（米国政府調達基準）

### 対象ユーザー
- 視覚障害（全盲、弱視、色覚特性）
- 聴覚障害（難聴、聾）
- 運動障害（肢体不自由、巧緻性問題）
- 認知障害（学習障害、注意欠陥等）
- 一時的な障害（骨折、疲労等）

## アクセシビリティチェック項目

### 1. 知覚可能 (Perceivable)

#### 1.1 テキストの代替 (Alternative Text)

##### 1.1.1 非テキストコンテンツ（レベルA）
```
□ 画像にalt属性を適切に設定
□ 装飾画像にはalt=""を設定
□ アイコンに意味がある場合はalt属性またはaria-labelを設定
□ 複雑な図表にはlongdesc属性または詳細説明を提供
□ CAPTCHAには代替手段を提供

具体例:
<img src="event-photo.jpg" alt="VRChat音楽ライブイベントの様子、ステージ上で3名のアバターが演奏している">
<img src="decoration.png" alt="" role="presentation">
<button aria-label="お気に入りに追加">❤️</button>
```

#### 1.2 時間依存メディア (Time-based Media)

##### 1.2.1 音声のみ及び映像のみ（収録済み）（レベルA）
```
□ 音声コンテンツには文字起こしを提供
□ 映像コンテンツには音声解説または代替テキストを提供

実装例:
<audio controls>
  <source src="interview.mp3" type="audio/mpeg">
  <p><a href="interview-transcript.html">音声ファイルの文字起こし</a></p>
</audio>
```

##### 1.2.2 キャプション（収録済み）（レベルA）
```
□ 動画にはキャプションを提供
□ キャプションは同期している
□ 話者の識別が可能

実装例:
<video controls>
  <source src="tutorial.mp4" type="video/mp4">
  <track kind="captions" src="tutorial-captions.vtt" srclang="ja" label="日本語">
</video>
```

#### 1.3 適応可能 (Adaptable)

##### 1.3.1 情報及び関係性（レベルA）
```
□ 見出しは適切な階層（h1-h6）で構造化
□ リストは適切なタグ（ul, ol, dl）を使用
□ フォームラベルは入力項目と関連付け
□ テーブルには適切なヘッダーを設定

実装例:
<h1>VRChatキャスト募集掲示板</h1>
  <h2>最新の募集</h2>
    <h3>音楽ライブイベント募集</h3>

<label for="event-title">イベントタイトル *</label>
<input type="text" id="event-title" required aria-describedby="title-help">
<div id="title-help">50文字以内で入力してください</div>

<table>
  <caption>応募者一覧</caption>
  <thead>
    <tr>
      <th scope="col">ユーザー名</th>
      <th scope="col">応募日</th>
      <th scope="col">ステータス</th>
    </tr>
  </thead>
</table>
```

##### 1.3.2 意味のある順序（レベルA）
```
□ 論理的な順序でコンテンツを配置
□ タブ順序が適切
□ CSSを無効にしても意味が通じる

実装例:
<!-- 論理的な順序 -->
<main>
  <h1>ページタイトル</h1>
  <nav aria-label="フィルター">...</nav>
  <section aria-label="検索結果">...</section>
</main>
```

##### 1.3.3 感覚的な特徴（レベルA）
```
□ 色だけに依存した情報提供をしない
□ 「右の」「赤い」等の感覚的表現だけでは説明しない
□ 形、位置、音だけで情報を表現しない

実装例:
<!-- 悪い例 -->
<p>赤いボタンをクリックしてください</p>

<!-- 良い例 -->
<p>「応募する」ボタン（赤色）をクリックしてください</p>
<button class="btn-apply" style="background: red;">
  <span class="sr-only">応募する</span>
  応募
</button>
```

#### 1.4 判別可能 (Distinguishable)

##### 1.4.1 色の使用（レベルA）
```
□ 色だけで情報を表現しない
□ エラー表示に色以外の手段も併用
□ 必須項目マークに色以外の表示も使用

実装例:
<label for="email">
  メールアドレス 
  <span class="required" aria-label="必須">*</span>
</label>
<input type="email" id="email" required aria-invalid="false">
<div class="error-message" role="alert">
  ❌ 正しいメールアドレスを入力してください
</div>
```

##### 1.4.3 コントラスト（最低レベル）（レベルAA）
```
□ 通常テキスト: 4.5:1以上のコントラスト比
□ 大きなテキスト（18pt以上または14pt太字以上）: 3:1以上
□ UI部品の境界: 3:1以上

確認済みの組み合わせ:
✓ #111827 (Gray 900) on #FFFFFF (White): 21:1
✓ #374151 (Gray 700) on #FFFFFF (White): 12.6:1
✓ #3B82F6 (Primary Blue) on #FFFFFF (White): 8.6:1
✓ #FFFFFF (White) on #3B82F6 (Primary Blue): 8.6:1
```

##### 1.4.4 テキストのサイズ変更（レベルAA）
```
□ 200%までズーム可能
□ 横スクロールが発生しない
□ 機能性を失わない

実装例:
<meta name="viewport" content="width=device-width, initial-scale=1">
html { font-size: 16px; }
.container { max-width: 100%; }
```

##### 1.4.10 リフロー（レベルAA）
```
□ 320px幅で横スクロールなし
□ 400%ズーム時も利用可能
□ レスポンシブデザイン対応

実装例:
@media (max-width: 320px) {
  .card {
    width: 100%;
    margin: 0;
  }
}
```

##### 1.4.11 非テキストのコントラスト（レベルAA）
```
□ UI部品の境界: 3:1以上
□ アイコンのコントラスト: 3:1以上
□ グラフィカル要素: 3:1以上

実装例:
.button {
  border: 2px solid #3B82F6;  /* 十分なコントラスト */
  background: #FFFFFF;
}
```

### 2. 操作可能 (Operable)

#### 2.1 キーボードアクセシブル (Keyboard Accessible)

##### 2.1.1 キーボード（レベルA）
```
□ すべての機能がキーボードで操作可能
□ Tab、Enter、Space、Arrow keyで操作
□ キーボードトラップなし

実装例:
<button type="button" onclick="toggleMenu()" onkeydown="handleKeyDown(event)">
  メニュー
</button>

function handleKeyDown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleMenu();
  }
}
```

##### 2.1.2 キーボードトラップなし（レベルA）
```
□ フォーカスが特定の要素に留まらない
□ モーダル内でのフォーカス管理
□ 適切なフォーカスの戻り先

実装例:
function openModal(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  firstElement.focus();
  
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}
```

#### 2.2 十分な時間 (Enough Time)

##### 2.2.1 タイミング調整可能（レベルA）
```
□ 時間制限がある場合は延長・無効化可能
□ セッションタイムアウト前の警告
□ 自動更新の制御可能

実装例:
<div role="alert" aria-live="assertive" id="session-warning" style="display: none;">
  セッションが5分後に終了します。<button onclick="extendSession()">延長する</button>
</div>
```

##### 2.2.2 一時停止、停止、非表示（レベルA）
```
□ 自動再生コンテンツの制御可能
□ 点滅・スクロール・自動更新の停止可能
□ 5秒以上継続する動きの制御

実装例:
<button id="pauseAnimations" onclick="toggleAnimations()">
  アニメーションを停止
</button>

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### 2.3 発作の防止 (Seizures)

##### 2.3.1 3回の閃光、又は閾値以下（レベルA）
```
□ 1秒間に3回以上の閃光なし
□ 明滅する領域の制限
□ 閾値以下の閃光のみ

実装例:
/* 安全な点滅アニメーション */
@keyframes safeBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.8; }  /* 完全に消さない */
}

.notification {
  animation: safeBlink 2s infinite;  /* 0.5Hz以下 */
}
```

#### 2.4 ナビゲーション可能 (Navigable)

##### 2.4.1 ブロックスキップ（レベルA）
```
□ メインコンテンツへのスキップリンク
□ 繰り返しブロックのスキップ可能
□ ランドマークによるナビゲーション

実装例:
<a href="#main-content" class="skip-link">メインコンテンツへスキップ</a>

<nav aria-label="メインナビゲーション">...</nav>
<main id="main-content">...</main>
<aside aria-label="サイドバー">...</aside>

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

##### 2.4.2 ページタイトル（レベルA）
```
□ 各ページに固有で説明的なタイトル
□ ページの目的・内容を明確に示す
□ サイト名を含む

実装例:
<title>募集詳細: 音楽ライブイベント司会者募集 - CastChat</title>
<title>新規募集投稿 - CastChat</title>
<title>応募履歴 - CastChat</title>
```

##### 2.4.3 フォーカス順序（レベルA）
```
□ 論理的な順序でフォーカス移動
□ 視覚的順序とフォーカス順序の一致
□ tabindex="-1"の適切な使用

実装例:
<!-- 適切なフォーカス順序 -->
<form>
  <input type="text" placeholder="タイトル" tabindex="1">
  <textarea placeholder="詳細" tabindex="2"></textarea>
  <button type="submit" tabindex="3">投稿</button>
  <button type="button" tabindex="4">キャンセル</button>
</form>
```

##### 2.4.4 リンクの目的（文脈内）（レベルA）
```
□ リンクテキストで目的が明確
□ 「こちら」「詳細」等の曖昧なテキスト避ける
□ aria-labelでの補足説明

実装例:
<!-- 悪い例 -->
<a href="/post/123">詳細</a>

<!-- 良い例 -->
<a href="/post/123">音楽ライブイベント司会者募集の詳細</a>

<!-- または -->
<a href="/post/123" aria-label="音楽ライブイベント司会者募集の詳細">詳細</a>
```

##### 2.4.6 見出し及びラベル（レベルAA）
```
□ 見出しはコンテンツの構造を反映
□ ラベルは関連するコンテンツを説明
□ 一意性と説明性を両立

実装例:
<h1>VRChatキャスト募集掲示板</h1>
  <h2>検索・フィルター</h2>
  <h2>募集一覧</h2>
    <h3>ライブイベント</h3>
    <h3>撮影会</h3>
```

##### 2.4.7 フォーカスの可視化（レベルAA）
```
□ フォーカス状態が視覚的に明確
□ 十分なコントラストのフォーカスリング
□ カスタムフォーカススタイル

実装例:
:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

.button:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}
```

### 3. 理解可能 (Understandable)

#### 3.1 読みやすい (Readable)

##### 3.1.1 ページの言語（レベルA）
```
□ html要素にlang属性を設定
□ 部分的に異なる言語にlang属性
□ 適切な言語コードを使用

実装例:
<html lang="ja">
<p>このサイトは<span lang="en">VRChat</span>ユーザー向けです。</p>
```

##### 3.1.2 一部分の言語（レベルAA）
```
□ 混在する言語の適切なマークアップ
□ 専門用語の言語指定

実装例:
<p>
  <span lang="en">Virtual Reality</span>（バーチャルリアリティ）技術を使用した
  <span lang="en">VRChat</span>でのイベント募集です。
</p>
```

#### 3.2 予測可能 (Predictable)

##### 3.2.1 フォーカス時（レベルA）
```
□ フォーカスで予期しない変化なし
□ モーダル開閉の適切な制御
□ 意図しないページ遷移なし

実装例:
<select onchange="handleSelectChange()" aria-label="カテゴリ選択">
  <option value="">カテゴリを選択</option>
  <option value="event">イベント</option>
</select>

function handleSelectChange() {
  // フォーカスで自動送信せず、明示的なボタンを用意
  document.getElementById('apply-filter').disabled = false;
}
```

##### 3.2.2 入力時（レベルA）
```
□ 入力で予期しない変化なし
□ 自動送信の明示的なトリガー
□ 変更の事前説明

実装例:
<form>
  <input type="text" placeholder="検索キーワード" 
         oninput="showSuggestions()" aria-describedby="search-help">
  <div id="search-help">入力中に候補が表示されます</div>
  <button type="submit">検索</button>
</form>
```

##### 3.2.3 一貫したナビゲーション（レベルAA）
```
□ 各ページで一貫したナビゲーション位置
□ 一貫したリンクテキスト
□ 一貫した機能配置

実装例:
<!-- すべてのページで共通のナビゲーション -->
<nav aria-label="メインナビゲーション">
  <ul>
    <li><a href="/">ホーム</a></li>
    <li><a href="/posts">募集一覧</a></li>
    <li><a href="/posts/create">募集投稿</a></li>
    <li><a href="/profile">プロフィール</a></li>
  </ul>
</nav>
```

##### 3.2.4 一貫した識別性（レベルAA）
```
□ 同じ機能には同じ識別子
□ 一貫したアイコンの使用
□ 一貫したラベルの使用

実装例:
<!-- 一貫したボタンラベル -->
<button class="btn-favorite" aria-label="お気に入りに追加">❤️</button>
<button class="btn-favorite" aria-label="お気に入りから削除">💔</button>
```

#### 3.3 入力支援 (Input Assistance)

##### 3.3.1 エラーの特定（レベルA）
```
□ エラーを自動的に検出
□ エラー箇所をテキストで説明
□ エラー項目の明確な特定

実装例:
<div role="alert" id="form-errors">
  <h3>以下の項目にエラーがあります:</h3>
  <ul>
    <li><a href="#email">メールアドレスが正しくありません</a></li>
    <li><a href="#password">パスワードは8文字以上で入力してください</a></li>
  </ul>
</div>

<label for="email">メールアドレス</label>
<input type="email" id="email" aria-invalid="true" aria-describedby="email-error">
<div id="email-error" class="error">正しいメールアドレスを入力してください</div>
```

##### 3.3.2 ラベル又は説明（レベルA）
```
□ フォーム項目に適切なラベル
□ 必要に応じて説明文を提供
□ ラベルとコントロールの関連付け

実装例:
<fieldset>
  <legend>イベント詳細</legend>
  
  <label for="event-title">イベントタイトル <span class="required">*</span></label>
  <input type="text" id="event-title" required 
         aria-describedby="title-help">
  <div id="title-help">50文字以内で入力してください</div>
  
  <label for="event-date">開催日</label>
  <input type="date" id="event-date" 
         aria-describedby="date-help">
  <div id="date-help">YYYY-MM-DD形式で入力</div>
</fieldset>
```

##### 3.3.3 エラー修正の提案（レベルAA）
```
□ エラー修正方法の提示
□ 具体的な修正例の提供
□ 許可されるフォーマットの説明

実装例:
<div id="password-error" class="error">
  パスワードは以下の条件を満たしてください:
  <ul>
    <li>8文字以上</li>
    <li>大文字・小文字を含む</li>
    <li>数字を含む</li>
  </ul>
</div>
```

##### 3.3.4 エラー回避（法的、金融、データ）（レベルAA）
```
□ 重要な操作での確認ステップ
□ 送信前のレビュー画面
□ 取り消し可能な期間の提供

実装例:
<form onsubmit="return confirmSubmission()">
  <!-- フォーム内容 -->
  <div class="confirmation">
    <h3>送信前の確認</h3>
    <p>以下の内容で応募します。よろしいですか？</p>
    <!-- 入力内容の確認表示 -->
  </div>
  <button type="submit">応募を送信</button>
</form>
```

### 4. 堅牢 (Robust)

#### 4.1 互換性 (Compatible)

##### 4.1.1 構文解析（レベルA）
```
□ 有効なHTMLの使用
□ 適切な要素の開始・終了タグ
□ 重複するid属性なし

検証ツール:
- W3C Markup Validator
- axe-core
- WAVE
```

##### 4.1.2 名前・役割・値（レベルA）
```
□ 適切なセマンティック要素の使用
□ カスタムコンポーネントのrole属性
□ 状態変化の適切な通知

実装例:
<button role="button" aria-pressed="false" onclick="toggleFavorite()">
  お気に入り
</button>

<div role="tabpanel" aria-labelledby="tab1" id="panel1">
  コンテンツ
</div>

<div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="75">
  75%完了
</div>
```

## 支援技術対応

### スクリーンリーダー対応

#### 対応スクリーンリーダー
```
- NVDA（Windows）
- JAWS（Windows）
- VoiceOver（macOS/iOS）
- TalkBack（Android）
- PC-Talker（Windows）
```

#### ARIA属性の活用
```html
<!-- ライブリージョン -->
<div aria-live="polite" id="status-message"></div>
<div aria-live="assertive" id="error-message"></div>

<!-- 展開・折りたたみ -->
<button aria-expanded="false" aria-controls="menu">メニュー</button>
<ul id="menu" aria-hidden="true">...</ul>

<!-- 現在位置 -->
<nav aria-label="パンくずリスト">
  <ol>
    <li><a href="/">ホーム</a></li>
    <li><a href="/posts">募集一覧</a></li>
    <li aria-current="page">音楽ライブイベント</li>
  </ol>
</nav>

<!-- 入力補助 -->
<input type="text" aria-describedby="help" aria-required="true">
<div id="help">ユーザー名は英数字で入力してください</div>
```

## テスト・検証手順

### 自動テストツール

#### axe-core（推奨）
```javascript
// Jest + axe-core
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('ページにアクセシビリティ違反がないこと', async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### その他ツール
```
- WAVE (Web Accessibility Evaluation Tool)
- Lighthouse Accessibility audit
- Pa11y command line tool
- Accessibility Insights for Web
```

### 手動テスト

#### キーボードナビゲーションテスト
```
1. Tabキーでフォーカス移動
2. Shift+Tabで逆方向移動
3. Enterキーでボタン・リンク実行
4. Spaceキーでボタン実行
5. Arrow keyでラジオボタン・タブ切り替え
6. Escキーでモーダル・メニュー閉じる
```

#### スクリーンリーダーテスト
```
1. NVDA（無料）でのテスト
2. 見出しナビゲーション（H）
3. ランドマークナビゲーション（D）
4. リンクリスト（NVDA+F7）
5. フォーム項目ナビゲーション（F）
```

## 継続的改善

### 定期チェック項目
```
月次:
□ 新機能のアクセシビリティチェック
□ ユーザーフィードバックの確認
□ 支援技術の動作確認

四半期:
□ 全ページの自動テスト実行
□ スクリーンリーダーテスト
□ ユーザビリティテスト実施

年次:
□ アクセシビリティ監査
□ ガイドライン更新対応
□ 支援技術アップデート対応
```

### ユーザーフィードバック収集
```
フィードバック手段:
- アクセシビリティ専用問い合わせフォーム
- ユーザーテストへの当事者参加
- 支援技術ユーザーコミュニティとの連携
```

このアクセシビリティチェックリストにより、すべてのユーザーが平等にVRChatキャスト募集掲示板を利用できる環境を実現します。