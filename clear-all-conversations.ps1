#!/usr/bin/env pwsh

Write-Host "🗑️  Clearing all conversations and messages..." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if serviceAccountKey.json exists
if (!(Test-Path "serviceAccountKey.json")) {
    Write-Host "❌ serviceAccountKey.json not found!" -ForegroundColor Red
    Write-Host "Please make sure serviceAccountKey.json is in the project root." -ForegroundColor Yellow
    exit 1
}

# Run the clear script
Write-Host "Running clear script..." -ForegroundColor Cyan
node clear-all-conversations.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully cleared all conversations and messages!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. When patients send messages to doctors, new conversations will be created" -ForegroundColor White
    Write-Host "2. These conversations will appear in the doctor's chat list" -ForegroundColor White
    Write-Host "3. Patients will also see them in their chat list" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Failed to clear conversations" -ForegroundColor Red
    exit 1
}
