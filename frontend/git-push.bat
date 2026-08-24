@echo off
cd /d "%~dp0"
echo ===================================================
echo   TVK GitHub Push Automation
echo ===================================================
echo.

echo [1/5] Initializing local Git repository...
git init

echo.
echo [2/5] Adding files to staging...
git add .

echo.
echo [3/5] Committing project files...
git commit -m "Initialize and push project files to GitHub"

echo.
echo [4/5] Setting main branch and remote URL...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/ranjithkumars2007/TVK.git

echo.
echo [5/5] Pushing to GitHub...
git push -u origin main

echo.
echo ===================================================
echo   Finished!
echo ===================================================
pause
