@echo off
echo.
echo ====================================
echo CastChat Build Script (Windows)
echo ====================================
echo.
echo Windows側でnode_modulesの問題により直接実行できません。
echo WSL環境でビルドを実行します。
echo.
echo ビルド中...
wsl bash -c "./scripts/wsl-build.sh build"
echo.
echo ビルド完了！
echo 成果物: dist/
pause