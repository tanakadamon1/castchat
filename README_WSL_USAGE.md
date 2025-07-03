# CastChat WSL環境での使用方法

## 開発サーバーの起動方法

### WSLターミナルから起動

```bash
# プロジェクトディレクトリに移動
cd /mnt/e/dev/castchat

# 開発サーバー起動
./dev.sh
```

### 直接スクリプトを実行

```bash
./scripts/wsl-build.sh dev
```

### 開発サーバー修正スクリプトを実行

```bash
./scripts/dev-server-fix.sh
```

## ビルドの実行方法

```bash
# ビルド実行
./scripts/wsl-build.sh build
```

## アクセスURL

開発サーバー起動後、以下のURLにアクセス：
- http://localhost:5173
- ポートが使用中の場合は5174、5175などに自動変更されます

## トラブルシューティング

### 500エラーが発生する場合

1. ブラウザのキャッシュをクリア（Ctrl+Shift+R）
2. 別のブラウザで試す
3. 開発者ツール（F12）でエラー詳細を確認

### プロセスが残っている場合

```bash
# Viteプロセスを終了
pkill -f vite
```

### 最新のコードが反映されない場合

```bash
# ソースコードを同期
./scripts/wsl-build.sh sync
```

## Windows側での操作について

`.bat`ファイルはWindows Command PromptやPowerShellから実行するためのものです。
WSL内では`.sh`ファイルを使用してください。

## 開発フロー

1. コード編集: Windows側のエディタ（VS Code等）で編集
2. 開発サーバー: WSL側で起動（`./dev.sh`）
3. ブラウザ: Windows側のブラウザでhttp://localhost:5173にアクセス
4. ホットリロード: 自動的に変更が反映されます