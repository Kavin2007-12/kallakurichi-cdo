@echo off
title CDO Kallakurichi - Full Stack Starter
echo ===================================================
echo   CDO Kallakurichi Constituency Digital Office
echo   Starting Database, Backend, and Frontend...
echo ===================================================

:: 1. Check if MySQL port 3306 is already in use
netstat -ano | findstr :3306 > nul
if %errorlevel% equ 0 (
    echo [OK] MySQL database server is already running.
) else (
    if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" (
        echo [DB] Starting local database server...
        start /b "MySQL Database" "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --datadir="%~dp0backend\database\data" --port=3306
        timeout /t 3 > nul
    ) else (
        echo [NOTICE] Local MySQL binary not found. Backend will use fallback database mode.
    )
)

:: 2. Start Backend Server
echo [API] Starting Express Backend Server...
cd /d "%~dp0backend"
start "CDO Backend API" cmd /c npm.cmd run dev

:: 3. Start Frontend Client
echo [Client] Starting Vite Frontend Server...
cd /d "%~dp0frontend"
start "CDO Citizen Frontend" cmd /c npm.cmd run dev

:: 4. Open Website in Browser
timeout /t 3 > nul
echo [Browser] Opening website...
start http://localhost:5173/

echo ===================================================
echo   All services launched! Keep this window open.
echo   Press any key in this window to stop all services...
echo ===================================================
pause > nul

:: Stop tasks on close
taskkill /f /im node.exe > nul 2>&1
taskkill /f /im mysqld.exe > nul 2>&1
echo Services stopped.
