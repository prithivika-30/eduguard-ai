# EduGuard AI One-Click Launch Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting EduGuard AI (Backend: 8000 | Frontend: 5173)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

# Launch Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; .\venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --port 8000 --host 127.0.0.1"

# Launch Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm.cmd run dev -- --port 5173 --host 127.0.0.1"

Start-Sleep -Seconds 2
Write-Host "Application is opening at http://127.0.0.1:5173" -ForegroundColor Green
Start-Process "http://127.0.0.1:5173"
