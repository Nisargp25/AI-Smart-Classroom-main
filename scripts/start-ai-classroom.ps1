$ErrorActionPreference = "Stop"

# Resolve project root from this script location (scripts/ -> project root).
$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

if (-not (Test-Path $backendDir)) {
    throw "Backend folder not found: $backendDir"
}
if (-not (Test-Path $frontendDir)) {
    throw "Frontend folder not found: $frontendDir"
}

# Prefer project virtual environment Python if present.
$venvPython = Join-Path $root ".venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    $pythonExe = $venvPython
} else {
    $pythonExe = "C:/Python314/python.exe"
}

$backendCmd = "Set-Location '$root'; & '$pythonExe' -m uvicorn server:app --app-dir '$backendDir' --host 0.0.0.0 --port 8000 --reload"
$frontendCmd = "Set-Location '$root'; $env:PORT='4000'; npm --prefix '$frontendDir' start"

Start-Process powershell -ArgumentList @('-NoExit', '-Command', $backendCmd) | Out-Null
Start-Process powershell -ArgumentList @('-NoExit', '-Command', $frontendCmd) | Out-Null

Write-Host "Started AI Smart Classroom backend and frontend in two new terminal windows."
Write-Host "Backend: http://localhost:8000/api/"
Write-Host "Frontend: http://localhost:4000/"
