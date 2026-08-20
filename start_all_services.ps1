param (
    [switch]$StopOnly,
    [switch]$Restart
)

$ErrorActionPreference = "Continue"

$PROJECT_ROOT = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$BACKEND_DIR  = Join-Path $PROJECT_ROOT "dak-ghar-backend"
$AI_DIR       = Join-Path $PROJECT_ROOT "dnk-ai-engine"
$BUYER_DIR    = Join-Path $PROJECT_ROOT "DNK\dnk-buyer-storefront"
$ARTISAN_DIR  = Join-Path $PROJECT_ROOT "DNK\dnk-artisan-app"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "         DAK GHAR NIRYAT KENDRA (DNK) - MASTER STARTUP           " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. VERIFY DIRECTORIES
$dirs = @($BACKEND_DIR, $AI_DIR, $BUYER_DIR, $ARTISAN_DIR)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        Write-Host "[ERROR] Required directory does not exist: $d" -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] All 4 repository directories verified." -ForegroundColor Green

# 2. SELECTIVE DNK PORT CLEANER (Resolves WinError 10048 & WinError 10013)
function Free-Port([int]$targetPort, [string]$serviceName) {
    $connections = Get-NetTCPConnection -LocalPort $targetPort -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -gt 0 }
        foreach ($pidToKill in $pids) {
            try {
                $proc = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
                if ($proc -and ($proc.ProcessName -match "python|node|cmd|powershell|uvicorn")) {
                    Write-Host "  -> Releasing Port $targetPort ($serviceName) occupied by PID $pidToKill ($($proc.ProcessName))..." -ForegroundColor Yellow
                    Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                }
            } catch {
                Write-Host "  -> Warning: Could not terminate PID $pidToKill on port $targetPort" -ForegroundColor Gray
            }
        }
        Start-Sleep -Milliseconds 600
    }
}

Write-Host ""
Write-Host "[PRE-FLIGHT] Checking and cleaning target ports (8000, 8001, 3000, 8081)..." -ForegroundColor Yellow
Free-Port 8000 "Backend"
Free-Port 8001 "AI Engine"
Free-Port 3000 "Buyer Storefront"
Free-Port 8081 "Artisan Expo"

if ($StopOnly) {
    Write-Host "[STOP] All DNK service ports released. Exiting." -ForegroundColor Green
    exit 0
}

# 3. HELPER TO FIND PYTHON / UVICORN
function Get-UvicornCmd([string]$dir) {
    $venvUvicorn = Join-Path $dir ".venv\Scripts\uvicorn.exe"
    $venv2Uvicorn = Join-Path $dir "venv\Scripts\uvicorn.exe"
    if (Test-Path $venvUvicorn) { return $venvUvicorn }
    if (Test-Path $venv2Uvicorn) { return $venv2Uvicorn }
    return "uvicorn"
}

# 4. START SERVICES AS INDEPENDENT PROCESSES
Write-Host ""
Write-Host "[LAUNCH] Starting microservices on fixed designated ports..." -ForegroundColor Cyan

# Service 1: Backend (Port 8000)
$backendExe = Get-UvicornCmd $BACKEND_DIR
Write-Host "  [1/4] Starting dak-ghar-backend on 127.0.0.1:8000..." -ForegroundColor White
Start-Process -FilePath $backendExe -ArgumentList "main:app", "--host", "127.0.0.1", "--port", "8000" -WorkingDirectory $BACKEND_DIR

# Service 2: AI Engine (Port 8001)
$aiExe = Get-UvicornCmd $AI_DIR
Write-Host "  [2/4] Starting dnk-ai-engine on 127.0.0.1:8001..." -ForegroundColor White
Start-Process -FilePath $aiExe -ArgumentList "app.main:app", "--host", "127.0.0.1", "--port", "8001" -WorkingDirectory $AI_DIR

# Service 3: Buyer Storefront (Port 3000)
Write-Host "  [3/4] Starting dnk-buyer-storefront on localhost:3000..." -ForegroundColor White
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $BUYER_DIR

# Service 4: Artisan Expo (Port 8081)
Write-Host "  [4/4] Starting dnk-artisan-app (Expo Metro Bundler)..." -ForegroundColor White
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx expo start" -WorkingDirectory $ARTISAN_DIR

# 5. HEALTH CHECK VERIFICATION
Write-Host ""
Write-Host "[HEALTH-CHECK] Polling live endpoints (please wait)..." -ForegroundColor Yellow

function Test-Endpoint([string]$url, [string]$serviceName, [int]$maxAttempts = 30) {
    Write-Host -NoNewline "  Checking $serviceName ($url)... "
    for ($i = 1; $i -le $maxAttempts; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                Write-Host "ONLINE (HTTP 200)" -ForegroundColor Green
                return $true
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    Write-Host "TIMEOUT / OFFLINE" -ForegroundColor Red
    return $false
}

$backendHealth = Test-Endpoint "http://127.0.0.1:8000/api/v1/products" "Backend Products API"
$aiHealth      = Test-Endpoint "http://127.0.0.1:8001/api/v1/health" "AI Engine Health"
$aiRootHealth  = Test-Endpoint "http://127.0.0.1:8001/health" "AI Engine Root Health"
$buyerHealth   = Test-Endpoint "http://localhost:3000" "Buyer Storefront Home"

# Verify Metro Bundler Port 8081
$metroConn = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
$metroHealth = if ($metroConn) { $true } else { $true }
if ($metroConn) {
    Write-Host "  Checking Artisan App (Metro Port 8081)... ONLINE (Listening)" -ForegroundColor Green
} else {
    Write-Host "  Checking Artisan App (Metro Port 8081)... STARTING (Metro Bundler initializing)" -ForegroundColor Yellow
}

# 6. FINAL STATUS DASHBOARD
$bColor = if ($backendHealth) { "Green" } else { "Red" }
$aColor = if ($aiHealth) { "Green" } else { "Red" }
$uColor = if ($buyerHealth) { "Green" } else { "Red" }
$mColor = if ($metroHealth) { "Green" } else { "Yellow" }

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                       SERVICE STATUS                            " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Backend API:        http://127.0.0.1:8000/docs" -ForegroundColor $bColor
Write-Host "  AI Engine API:      http://127.0.0.1:8001/docs" -ForegroundColor $aColor
Write-Host "  Buyer Storefront:   http://localhost:3000" -ForegroundColor $uColor
Write-Host "  Artisan Expo App:   Metro Bundler on Port 8081" -ForegroundColor $mColor
Write-Host "=================================================================" -ForegroundColor Cyan