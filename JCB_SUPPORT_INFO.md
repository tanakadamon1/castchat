# JCB対応状況について

## JCB対応の概要

### ✅ Square での JCB 対応
- **日本のSquareアカウント**: JCB対応
- **対応地域**: 主に日本国内
- **カードタイプ**: クレジットカードのみ（デビット・プリペイドは制限あり）

## JCB使用時の注意点

### 1. 地域制限
- **日本のSquareアカウント**: JCB利用可能
- **海外のSquareアカウント**: JCB非対応の場合が多い
- **ロケーション設定**: 日本に設定されている必要がある

### 2. カードタイプ制限
- ✅ **JCBクレジットカード**: 対応
- ❌ **JCBデビットカード**: 制限あり
- ❌ **JCBプリペイドカード**: 制限あり

### 3. Square設定確認

Square Developer Dashboard で以下を確認：

#### Payment Methods 設定
```
□ Visa
□ Mastercard  
□ JCB          ← これが有効になっているか
□ American Express
```

#### Location 設定
```
Country: Japan
Currency: JPY
Business Type: [適切に設定]
```

## 現在のエラーの原因

`CARD_NOT_SUPPORTED` エラーが発生している原因：

### 可能性1: Square設定でJCBが無効
- Square Dashboard でJCBが有効化されていない
- ロケーション設定が日本以外

### 可能性2: カードの種類
- JCBデビットカードを使用
- JCBプリペイドカードを使用
- 企業カードなど特殊なカード

### 可能性3: カードの状態
- カードの利用制限
- 海外取引の制限
- インターネット決済の制限

## 対処法

### 1. Square設定確認
1. Square Developer Dashboard にログイン
2. Applications → [アプリ名] → Locations
3. Payment Methods でJCBが有効か確認
4. Location が Japan に設定されているか確認

### 2. 別のカードで比較テスト
- **Visa/Mastercardクレジットカード**で成功するか確認
- 成功すれば、JCB固有の問題と特定可能

### 3. JCBカードの種類確認
使用したJCBカードについて：
- クレジットカードかデビットカードか
- 発行会社（三井住友、三菱UFJ等）
- カードのグレード（一般、ゴールド等）

## Square JCB対応の詳細

### 対応状況
```
地域: 日本
通貨: JPY
カードタイプ: クレジットカード
取引タイプ: オンライン決済
```

### 制限事項
- デビット・プリペイドカードは制限あり
- 一部の企業カードは非対応
- 海外発行のJCBカードは制限あり

## 推奨テスト手順

1. **まずVisa/Mastercardでテスト**
   - システム全体の動作確認

2. **Square設定でJCB有効化確認**
   - Dashboard で設定確認

3. **JCBクレジットカードでテスト**
   - デビット・プリペイド以外を使用

4. **エラーが続く場合**
   - Square サポートに問い合わせ
   - JCB発行会社に確認