# Square決済テスト用カード番号

## サンドボックス環境用テストカード

### 成功する決済用カード番号

#### Visa（最も推奨）
- **カード番号**: `4111111111111111` ← **まずこれを試してください**
- **有効期限**: `12/25`
- **CVV**: `123`
- **郵便番号**: `12345`

#### Visa（代替）
- **カード番号**: `4532123456789012` ← **スペースなしで入力**
- **有効期限**: `01/26`
- **CVV**: `456`
- **郵便番号**: `54321`

#### Mastercard
- **カード番号**: `5555555555554444` ← **スペースなしで入力**
- **有効期限**: `12/25`
- **CVV**: `123`
- **郵便番号**: `12345`

#### American Express
- **カード番号**: `378282246310005` ← **スペースなしで入力**
- **有効期限**: `12/25`
- **CVV**: `1234`
- **郵便番号**: `12345`

### エラーテスト用カード番号

#### 拒否される決済（CARD_DECLINED）
- **カード番号**: `4000 0000 0000 0002`
- **有効期限**: 任意の将来の日付
- **CVV**: 任意の3桁

#### 処理エラー（GENERIC_DECLINE）
- **カード番号**: `4000 0000 0000 0119`
- **有効期限**: 任意の将来の日付
- **CVV**: 任意の3桁

#### CVV不一致（CVV_FAILURE）
- **カード番号**: `4000 0000 0000 0127`
- **有効期限**: 任意の将来の日付
- **CVV**: 任意の3桁

## 使用方法

### 1. 開発環境での使用
- 現在のSquare環境: `sandbox`
- 上記のテストカード番号を使用してください

### 2. 本番環境での使用
- 実際のクレジットカード番号を使用
- 実際の課金が発生します

## 注意事項

- **サンドボックス環境では実際の課金は発生しません**
- **本番環境では実際の課金が発生します**
- テストカード番号は本番環境では使用できません
- 本番環境でのテストは慎重に行ってください

## 現在の環境設定

### 開発環境（localhost）
```
VITE_SQUARE_ENVIRONMENT=sandbox
VITE_SQUARE_APPLICATION_ID=sq0idp-B14qxTBImozUtJkfnpGPrA
VITE_SQUARE_LOCATION_ID=LS9BK1V1R5JZA
```

### 本番環境
```
VITE_SQUARE_ENVIRONMENT=production
VITE_SQUARE_APPLICATION_ID=sq0idp-B14qxTBImozUtJkfnpGPrA
VITE_SQUARE_LOCATION_ID=LS9BK1V1R5JZA
```

## トラブルシューティング

### よくあるエラー

1. **"Credit card number is not valid for sandbox use"**
   - サンドボックス環境で実際のカード番号を使用している
   - 上記のテストカード番号を使用してください

2. **"Tokenization has failed"**
   - 無効なカード番号を入力している
   - テストカード番号を正確に入力してください

3. **"Bad Request (400)"**
   - 環境設定が正しくない
   - 環境変数を確認してください

### デバッグ方法

1. **環境変数の確認**
   ```javascript
   console.log('Square Config:', {
     applicationId: import.meta.env.VITE_SQUARE_APPLICATION_ID,
     locationId: import.meta.env.VITE_SQUARE_LOCATION_ID,
     environment: import.meta.env.VITE_SQUARE_ENVIRONMENT
   });
   ```

2. **Square SDKの確認**
   ```javascript
   console.log('Square SDK loaded:', typeof window.Square !== 'undefined');
   ```

3. **決済処理のデバッグ**
   - ブラウザの開発者ツールでネットワークタブを確認
   - コンソールでエラーメッセージを確認