@echo off
chcp 65001 >nul
echo ===================================================
echo   Starting Hiu-Hiu Anti-Scam Web Application
echo ===================================================

:: 1. Start Django Backend (Uses built-in db.sqlite3 database)
echo [1/2] Starting Django Backend on http://localhost:8000 ...
start "Hiu-Hiu Backend" cmd /k "cd /d "%~dp0hiu-hiu backend" && "%~dp0hiu-hiu backend\venv\Scripts\python.exe" manage.py runserver 0.0.0.0:8000"

:: 2. Start Next.js Frontend
echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "Hiu-Hiu Frontend" cmd /k "cd /d "%~dp0project\frontend" && npm run dev"

echo.
echo All services started! (No XAMPP needed)
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8000
pause
