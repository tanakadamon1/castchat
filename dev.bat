@echo off
echo.
echo ====================================
echo CastChat Development Server (Windows)
echo ====================================
echo.
echo Windows側でnode_modulesの問題により直接実行できません。
echo WSL環境で開発サーバーを起動します。
echo.
echo 起動中...
wsl bash -c "cd ~/castchat-wsl && npm run dev"