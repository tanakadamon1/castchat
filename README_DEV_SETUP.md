# CastChat 開発環境セットアップガイド

## 🚨 重要: Windows WSL環境での開発について

現在、Windows側のnode_modules破損により、直接npm/viteコマンドが実行できません。
以下の手順で開発を行ってください。

## 開発環境セットアップ

### 1. 初回セットアップ（WSL内）
```bash
# WSL環境にプロジェクトをセットアップ
./scripts/wsl-build.sh setup
```

### 2. 開発サーバー起動

#### 方法A: Windowsから（推奨）
```cmd
# コマンドプロンプトまたはPowerShellで実行
dev.bat
```

#### 方法B: WSL内から
```bash
./scripts/wsl-build.sh dev
```

開発サーバーURL: http://localhost:5173

### 3. ビルド実行

#### 方法A: Windowsから（推奨）
```cmd
# コマンドプロンプトまたはPowerShellで実行
build.bat
```

#### 方法B: WSL内から
```bash
./scripts/wsl-build.sh build
```

ビルド成果物: `dist/`フォルダに生成されます

## 開発フロー

1. **コード編集**: Windows側のエディタ（VS Code等）で編集
2. **自動同期**: WSL側で自動的に変更を検知
3. **ホットリロード**: ブラウザが自動更新

## トラブルシューティング

### ポート使用中エラー
```
Port 5173 is in use, trying another one...
```
→ 別のポート（5174, 5175等）で起動されます

### node_modulesエラー
```
Cannot find package 'vite'
```
→ Windows側では実行できません。WSL環境を使用してください

### 同期の問題
```bash
# 手動でソースコードを同期
./scripts/wsl-build.sh sync
```

## 推奨される恒久的解決策

1. **VS Code Dev Containers**の使用
   - `.devcontainer/devcontainer.json`が設定済み
   - 完全に隔離された開発環境

2. **WSLネイティブ開発**
   - `~/castchat-wsl`で直接開発
   - Windows側は閲覧のみ

3. **node_modules完全修復**
   - Windows側でPowerShell管理者権限で削除
   - 新規インストール

## サポート

問題が解決しない場合は、インフラ担当に連絡してください。