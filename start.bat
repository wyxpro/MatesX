@echo off
setlocal enabledelayedexpansion

:: =====================================================================
:: MatesX Project Auto-Starter
:: =====================================================================

title MatesX - Intelligent AI Companion
color 0b

echo.
echo    __  ___      __           _  __
echo   /  ^|/  /___ _/ /____  _____ ^| ^|/ /
echo  / /^|_/ / __ `/ __/ _ \/ ___/ ^|   / 
echo / /  / / /_/ / /_/  __(__  ) /   ^|  
echo/_/  /_/\__,_/\__/\___/____/ /_/ ^|_^|  
echo.
echo =====================================================================
echo  [MatesX] Starting environment...
echo =====================================================================
echo.

:: 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

:: 2. Install/Update Requirements
echo [1/3] Checking dependencies...
pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo [WARNING] Some dependencies failed to install. 
    echo Please check your internet connection or run 'pip install -r requirements.txt' manually.
) else (
    echo [SUCCESS] Dependencies are ready.
)

:: 3. Launch Web UI (Delayed)
echo [2/3] Preparing Web UI...
echo [INFO] Server will run on: http://127.0.0.1:8000
echo [INFO] Web UI path: http://127.0.0.1:8000/web/home.html
echo.

:: We use a temporary VBS script to open the browser after a 3s delay so the server has time to start
echo WScript.Sleep 3000 > %temp%\sleep.vbs
echo Set WshShell = WScript.CreateObject("WScript.Shell") >> %temp%\sleep.vbs
echo WshShell.Run "http://127.0.0.1:8000/web/home.html" >> %temp%\sleep.vbs
start /b wscript %temp%\sleep.vbs

:: 4. Run Application
echo [3/3] Launching FastAPI server...
echo ---------------------------------------------------------------------
python main.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Application crashed. Please check the logs above.
    pause
)

del %temp%\sleep.vbs 2>nul
endlocal
