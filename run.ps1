# MatesX Project Auto-Starter (PowerShell)

$Host.UI.RawUI.WindowTitle = "MatesX - Intelligent AI Companion"

Write-Host "`n   __  ___      __           _  __" -ForegroundColor Cyan
Write-Host "  /  |/  /___ _/ /____  _____ | |/ /" -ForegroundColor Cyan
Write-Host " / /|_/ / __ \`/ __/ _ \/ ___/ |   / " -ForegroundColor Cyan
Write-Host "/ /  / / /_/ / /_/  __(__  ) /   |  " -ForegroundColor Cyan
Write-Host "/_/  /_/\__,_/\__/\___/____/ /_/ |_|  " -ForegroundColor Cyan
Write-Host "`n=====================================================================" -ForegroundColor Gray
Write-Host " [MatesX] Starting environment..." -ForegroundColor White
Write-Host "=====================================================================`n" -ForegroundColor Gray

# 1. Check Python
try {
    $pythonVersion = python --version
    Write-Host "[SUCCESS] Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH." -ForegroundColor Red
    Pause
    exit
}

# 2. Install/Update Requirements
Write-Host "[1/3] Checking dependencies..." -ForegroundColor White
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Some dependencies failed to install." -ForegroundColor Yellow
} else {
    Write-Host "[SUCCESS] Dependencies are ready." -ForegroundColor Green
}

# 3. Launch Web UI (Async)
Write-Host "[2/3] Preparing Web UI..." -ForegroundColor White
$url = "http://127.0.0.1:8000/web/home.html"
Write-Host "[INFO] Web UI path: $url" -ForegroundColor Cyan

# Start a background task to wait 3 seconds and then open the browser
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process $using:url
} | Out-Null

# 4. Run Application
Write-Host "[3/3] Launching FastAPI server...`n" -ForegroundColor White
Write-Host "---------------------------------------------------------------------" -ForegroundColor Gray
python main.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Application crashed. Please check the logs above." -ForegroundColor Red
    Pause
}
