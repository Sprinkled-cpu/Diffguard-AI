# DiffGuard AI Launcher Script (PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   DIFFGUARD AI - THE DIGITAL MECHANIC FOR BROKEN APIS   " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Check Python venv
$PythonExe = ".\venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    Write-Host "[!] Virtual environment not detected. Creating venv..." -ForegroundColor Yellow
    python -m venv venv
    .\venv\Scripts\python -m pip install -r backend\requirements.txt
}

# Start Backend Server
Write-Host "[+] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$BackendJob = Start-Process -FilePath $PythonExe -ArgumentList "-m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload" -PassThru

# Start Frontend Dev Server
Write-Host "[+] Launching Vite + React Retro Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location frontend
npm run dev
