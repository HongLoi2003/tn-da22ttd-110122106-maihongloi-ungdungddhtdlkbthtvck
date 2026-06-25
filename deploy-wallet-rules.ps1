#!/usr/bin/env pwsh
# Deploy Firestore rules for wallet, transactions, and payment methods

Write-Host "🚀 Deploying Firestore rules..." -ForegroundColor Cyan

# Check if Firebase CLI is installed
if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "Please install Firebase CLI:" -ForegroundColor Yellow
    Write-Host "npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Deploy rules
Write-Host "Deploying firestore rules..." -ForegroundColor Green
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Firestore rules deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The following collections are now accessible:" -ForegroundColor Cyan
    Write-Host "  - wallets (create, read, update, delete by owner)" -ForegroundColor White
    Write-Host "  - transactions (create, read, update, delete by owner)" -ForegroundColor White
    Write-Host "  - paymentMethods (create, read, update, delete by owner)" -ForegroundColor White
} else {
    Write-Host "❌ Failed to deploy Firestore rules" -ForegroundColor Red
    exit 1
}
