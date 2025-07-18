# ⚠️ 本番環境決済テスト - 重要な注意事項

## 現在の環境設定
- **Square環境**: `production` (本番環境)
- **決済処理**: **実際の課金が発生します**

## 本番環境でのテスト手順

### 1. 小額テストの実施
- **推奨テスト金額**: 100円（1コイン）
- **実際のクレジットカードを使用**
- **実際の課金が発生します**

### 2. 使用可能なカード
本番環境では実際のクレジットカードのみ使用可能：
- Visa
- Mastercard
- American Express
- JCB

### 3. テスト後の処理
- 必要に応じて返金処理を実施
- Square Dashboardで取引確認
- 決済履歴の記録確認

## ⚠️ 重要な警告

1. **実際の課金が発生**
   - テストカード番号は使用できません
   - 実際のクレジットカードが必要です
   - 課金は実際に請求されます

2. **返金について**
   - テスト決済の返金は手動で行う必要があります
   - Square Dashboardから返金処理可能
   - 返金には数日かかる場合があります

3. **セキュリティ**
   - カード情報は暗号化されます
   - PCI準拠の安全な決済処理
   - カード情報はサーバーに保存されません

## 推奨テスト方法

### 最小限のテスト
1. 100円（1コイン）でテスト
2. 決済成功を確認
3. コイン残高の更新を確認
4. 必要に応じて返金

### 包括的なテスト
1. 正常な決済フロー
2. エラーハンドリング（無効なカード等）
3. 取引履歴の確認
4. レシート表示の確認

## トラブルシューティング

### よくある問題
1. **決済が拒否される**
   - カード情報を確認
   - 利用限度額を確認
   - カード会社に確認

2. **エラーメッセージ**
   - ブラウザコンソールを確認
   - Edge Functionログを確認
   - Square Dashboardで詳細確認

## 連絡先
- システム管理者
- Square サポート
- 技術サポート