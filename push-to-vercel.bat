@echo off
chcp 65001 >nul
echo ===================================================
echo   Uploading Hiu-Hiu Updates to GitHub / Vercel / Render
echo ===================================================
cd /d "%~dp0"
git push origin main
echo.
echo ===================================================
echo   Done! Vercel and Render will automatically update
echo   in about 1-2 minutes.
echo ===================================================
pause
