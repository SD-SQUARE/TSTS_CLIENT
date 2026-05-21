# TSTS Desktop App Build Script
# Run from client/tsts/electron: .\build.ps1

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "=== TSTS Desktop Build ===" -ForegroundColor Cyan
Write-Host "Working directory: $scriptDir" -ForegroundColor Gray

# Step 1: Check for rustdesk.exe
Write-Host "`n[1/3] Checking RustDesk binary..." -ForegroundColor Yellow
$rustdeskPath = Join-Path $scriptDir "rustdesk\rustdesk.exe"
if (-not (Test-Path $rustdeskPath)) {
    Write-Host "WARNING: rustdesk\rustdesk.exe not found!" -ForegroundColor Yellow
    Write-Host "Copy rustdesk.exe to: $rustdeskPath" -ForegroundColor Yellow
    Write-Host "The installer will build but RustDesk won't be bundled." -ForegroundColor Yellow
} else {
    $size = [Math]::Round((Get-Item $rustdeskPath).Length / 1MB, 1)
    Write-Host "RustDesk binary found ($size MB)" -ForegroundColor Green
}

# Step 2: Verify icon exists
Write-Host "`n[2/3] Checking icons..." -ForegroundColor Yellow
$iconPath = Join-Path $scriptDir "icon.ico"
if (-not (Test-Path $iconPath)) {
    Write-Host "ERROR: icon.ico not found at $iconPath" -ForegroundColor Red
    exit 1
}
Write-Host "Icons OK" -ForegroundColor Green

# Step 3: Build the installer from the frontend root
Write-Host "`n[3/3] Building installer..." -ForegroundColor Yellow
$clientDir = Join-Path $scriptDir ".."
Push-Location $clientDir
npm run desktop:release
if ($LASTEXITCODE -ne 0) { Write-Host "Installer build failed!" -ForegroundColor Red; Pop-Location; exit 1 }
npm run desktop:copy:backend
if ($LASTEXITCODE -ne 0) { Write-Host "Backend copy failed!" -ForegroundColor Red; Pop-Location; exit 1 }
Pop-Location

Write-Host "`n=== Build Complete ===" -ForegroundColor Green
$installerPath = Join-Path $scriptDir "release\TSTS-Desktop-Setup.exe"
if (Test-Path $installerPath) {
    $size = [Math]::Round((Get-Item $installerPath).Length / 1MB, 1)
    Write-Host "Installer: $installerPath ($size MB)" -ForegroundColor Cyan
}
