# カード対応状況テストガイド

## 現在のエラー
```
Square Error: CARD_NOT_SUPPORTED
Detail: Authorization error: 'CARD_NOT_SUPPORTED'
```

## 対処法

### 1. 別のカードで試す
以下の種類のカードを試してください：

#### 推奨カードタイプ
- **日本国内発行のVisa**
- **日本国内発行のMastercard**
- **クレジットカード**（デビット・プリペイド以外）

#### 避けるべきカードタイプ
- 海外発行のカード
- デビットカード
- プリペイドカード
- 企業カード（一部制限あり）

### 2. Square設定確認
Square Developer Dashboard で確認：

1. **Location Settings**
   - 国: Japan
   - 通貨: JPY
   - ビジネスタイプ: 適切に設定

2. **Payment Methods**
   - Visa: 有効
   - Mastercard: 有効
   - JCB: 有効（日本）
   - American Express: 有効

### 3. 一時的なサンドボックステスト

カード対応の問題を切り分けるため、サンドボックス環境でテスト：

```bash
# .env.local を一時的に変更
VITE_SQUARE_ENVIRONMENT=sandbox
VITE_SQUARE_APPLICATION_ID=sandbox-sq0idb-nZdW-A1sXK6CFOs2C7dotQ
VITE_SQUARE_LOCATION_ID=LH2R4ZQXB8Q2W
```

**サンドボックス用テストカード**:
```
カード番号: 4111111111111111
有効期限: 12/25
CVV: 123
郵便番号: 12345
```

### 4. デバッグ情報収集

以下の情報も確認してください：

1. **使用したカード情報**（安全な範囲で）
   - カードブランド（Visa/Mastercard等）
   - 発行国
   - カードタイプ（クレジット/デビット）

2. **ブラウザ情報**
   - ブラウザの種類とバージョン
   - 地域設定

3. **ネットワーク**
   - VPN使用の有無
   - プロキシ設定

## 次のステップ

1. **別のカードで再テスト**
2. **サンドボックス環境での動作確認**
3. **Square設定の確認**
4. **必要に応じてSquareサポートに問い合わせ**