#!/usr/bin/env pwsh
# Script để khởi động Email API Server

Write-Host "🚀 Starting HeartCare Email API Server..." -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure it." -ForegroundColor Yellow
    exit 1
}

# Kiểm tra node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Khởi động server
Write-Host "✅ Starting server on http://localhost:3001..." -ForegroundColor Green
npm start
