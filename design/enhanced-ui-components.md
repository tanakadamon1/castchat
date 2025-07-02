# エラー・ローディング状態改善仕様書

## 改善概要

最優先タスクに基づき、LoadingSpinner.vueとErrorState.vueコンポーネントをユーザーフレンドリーかつ詳細な情報提供が可能な形に大幅改善しました。

## 1. LoadingSpinner.vue 改善点

### 新機能追加
1. **進捗表示機能**
   - 進捗バー（0-100%）
   - 推定残り時間表示
   - パーセンテージ表示

2. **詳細ステップ表示**
   - 複数ステップの処理進行状況
   - 各ステップの完了・実行中・待機状態
   - チェックアイコンとスピナーの組み合わせ

3. **バリエーション機能**
   - 成功・警告・エラー状態での色変更
   - サイズバリエーション（sm/md/lg）
   - フルスクリーン表示対応

4. **アクセシビリティ強化**
   - aria-label、role属性追加
   - aria-live regions対応
   - 動作削減モード対応

### 使用例
```vue
<!-- 基本的な使用 -->
<LoadingSpinner message="データを読み込んでいます..." />

<!-- 進捗表示付き -->
<LoadingSpinner
  message="画像をアップロード中..."
  :show-progress="true"
  :progress="uploadProgress"
  estimated-time="あと30秒"
/>

<!-- ステップ表示付き -->
<LoadingSpinner
  message="投稿を処理中..."
  :show-details="true"
  :steps="['画像をアップロード', 'データを保存', '通知を送信']"
  :current-step="currentStep"
/>

<!-- フルスクリーン -->
<LoadingSpinner
  message="システムを初期化しています..."
  :full-screen="true"
  variant="success"
/>
```

### スタイル特徴
- **グラデーション進捗バー**: 視覚的に美しい進行表示
- **ステップインジケーター**: 各段階の明確な可視化
- **レスポンシブ対応**: モバイルでも最適表示
- **ダークモード対応**: システム設定に応じた色調整

## 2. ErrorState.vue 改善点

### 新機能追加
1. **エラー種別の拡張**
   - general, network, not-found, forbidden
   - server, timeout, validation（新規追加）

2. **重要度レベル**
   - low, medium, high, critical
   - 色とアイコンで視覚的に区別

3. **詳細情報表示**
   - エラーコード表示
   - 発生時刻記録
   - ユーザーエージェント情報（デバッグ用）

4. **アクションボタン拡張**
   - 再試行ボタン（ローディング状態付き）
   - ホームに戻るボタン
   - 問題報告ボタン
   - ヘルプページリンク

5. **エラー報告機能**
   - 自動エラーデータ収集
   - メール送信フォールバック
   - 構造化されたエラー情報

### 使用例
```vue
<!-- 基本的なエラー -->
<ErrorState 
  type="network"
  @retry="handleRetry"
/>

<!-- 詳細情報付きエラー -->
<ErrorState
  type="server"
  title="サーバーメンテナンス中"
  message="現在システムメンテナンスを実施しています。"
  severity="high"
  error-code="SRV-503"
  :timestamp="errorTime"
  :show-details="true"
  :show-report="true"
  @retry="handleRetry"
  @report="handleErrorReport"
/>

<!-- カスタムアクション -->
<ErrorState type="forbidden">
  <template #actions>
    <BaseButton @click="login">ログイン</BaseButton>
    <BaseButton variant="outline" @click="goHome">ホーム</BaseButton>
  </template>
</ErrorState>
```

### エラータイプ別表示

#### Network Error
- **アイコン**: Wi-Fiアイコン
- **色**: 黄色系
- **メッセージ**: 接続確認を促す具体的な説明

#### Not Found
- **アイコン**: 検索アイコン
- **色**: グレー系
- **メッセージ**: URL確認やページ移動の提案

#### Server Error
- **アイコン**: クラウドアイコン
- **色**: 赤色系（severity: critical）
- **メッセージ**: 管理者への連絡済みを明示

#### Validation Error
- **アイコン**: 警告アイコン
- **色**: オレンジ系
- **メッセージ**: 入力内容の確認を促す

## 3. Toast通知の視覚的改善

### 新しいToastデザイン
```vue
<!-- components/ui/Toast.vue 改善案 -->
<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      :class="toastClasses"
      role="alert"
      aria-live="assertive"
    >
      <!-- アイコン -->
      <div :class="iconContainerClasses">
        <component :is="iconComponent" :class="iconClasses" />
      </div>
      
      <!-- メッセージ -->
      <div class="flex-1 min-w-0">
        <p :class="messageClasses">{{ message }}</p>
        <p v-if="description" class="text-sm text-gray-500 mt-1">
          {{ description }}
        </p>
      </div>
      
      <!-- アクション -->
      <div v-if="actionText" class="flex-shrink-0">
        <button
          @click="$emit('action')"
          :class="actionClasses"
        >
          {{ actionText }}
        </button>
      </div>
      
      <!-- 閉じるボタン -->
      <button
        @click="$emit('close')"
        class="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-500"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </Transition>
</template>
```

### Toast種別とスタイル
```css
/* 成功Toast */
.toast-success {
  background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%);
  border-left: 4px solid #10B981;
}

/* エラーToast */
.toast-error {
  background: linear-gradient(135deg, #FEF2F2 0%, #FFFBFB 100%);
  border-left: 4px solid #EF4444;
}

/* 警告Toast */
.toast-warning {
  background: linear-gradient(135deg, #FFFBEB 0%, #FEFCF0 100%);
  border-left: 4px solid #F59E0B;
}

/* 情報Toast */
.toast-info {
  background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
  border-left: 4px solid #3B82F6;
}
```

## 4. 実装における注意点

### パフォーマンス最適化
1. **アニメーション最適化**
   - CSS transformsを使用
   - GPU加速の活用
   - 動作削減モード対応

2. **メモリ効率**
   - 不要なDOM要素の削除
   - イベントリスナーの適切なクリーンアップ

### アクセシビリティ配慮
1. **スクリーンリーダー対応**
   - role属性の適切な設定
   - aria-live regionsの活用
   - フォーカス管理

2. **キーボード操作**
   - Tabキーでの移動
   - Enterキーでのアクション実行
   - Escapeキーでの閉じる操作

### 国際化対応
1. **多言語対応準備**
   - メッセージのキー化
   - 動的な言語切替対応

2. **文化的配慮**
   - 色の意味の文化差
   - アイコンの認識度

## 5. テスト仕様

### 単体テスト
```typescript
// LoadingSpinner.test.ts
describe('LoadingSpinner', () => {
  test('進捗表示が正しく動作する', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        showProgress: true,
        progress: 50
      }
    })
    
    expect(wrapper.find('.progress-fill').element.style.width).toBe('50%')
  })
  
  test('ステップ表示が正しく動作する', () => {
    const steps = ['ステップ1', 'ステップ2', 'ステップ3']
    const wrapper = mount(LoadingSpinner, {
      props: {
        showDetails: true,
        steps,
        currentStep: 1
      }
    })
    
    expect(wrapper.findAll('.step-completed')).toHaveLength(1)
    expect(wrapper.findAll('.step-current')).toHaveLength(1)
    expect(wrapper.findAll('.step-pending')).toHaveLength(1)
  })
})
```

### E2Eテスト
```typescript
// error-handling.e2e.ts
describe('エラーハンドリング', () => {
  test('ネットワークエラー時の表示', async () => {
    // ネットワークを無効化
    await page.setOfflineMode(true)
    
    await page.goto('/posts')
    
    // ErrorStateが表示されることを確認
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible()
    await expect(page.locator('text=ネットワークエラー')).toBeVisible()
    
    // 再試行ボタンが機能することを確認
    await page.click('button:has-text("再試行")')
    await expect(page.locator('text=再試行中...')).toBeVisible()
  })
})
```

## 6. 運用における改善効果

### ユーザーエクスペリエンス向上
1. **明確な状況把握**
   - 処理の進行状況が分かりやすい
   - エラーの原因と対処法が明確

2. **信頼性向上**
   - プロフェッショナルな外観
   - 問題報告機能による品質改善

### 開発・保守性向上
1. **デバッグ効率化**
   - 詳細なエラー情報
   - ユーザー環境の自動収集

2. **コンポーネント再利用性**
   - 柔軟なprops設計
   - 様々な用途に対応

この改善により、CastChatのユーザーインターフェースは大幅に向上し、ユーザーがストレスなく利用できる環境が整備されます。