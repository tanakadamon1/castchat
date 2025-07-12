# Square設定修正ガイド

## 問題
Location ID `LH2R4ZQXB8Q2W` での決済が許可されていないエラー

## 解決手順

### 1. Square Developer Dashboardで正しいLocation IDを確認

1. https://developer.squareup.com/ にログイン
2. Applications → あなたのアプリを選択
3. Sandbox → Locations
4. 利用可能なLocation IDをメモ

### 2. アクセストークンも再確認

1. 同じページでSandbox → Credentials
2. Sandbox Access Token をコピー

### 3. Supabaseの環境変数を更新

正しい値でSupabaseの環境変数を更新：

```
SQUARE_ACCESS_TOKEN=[新しいアクセストークン]
SQUARE_LOCATION_ID=[新しいLocation ID]
SQUARE_ENVIRONMENT=sandbox
```

### 4. 一時的なデフォルトLocation IDを試す

もしくは、Square Sandboxの一般的なデフォルトLocation IDを試してみる：

```
SQUARE_LOCATION_ID=LHBM5SQHWXVX6
```

## 注意
- アクセストークンとLocation IDは同じSquareアカウント/アプリから取得する必要があります
- Sandbox環境とProduction環境でIDは異なります