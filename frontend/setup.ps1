# Frontend Setup Script for Windows
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OSINT Platform - Frontend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location -Path "C:\Users\dell\OneDrive\Desktop\OSINT\frontend"

# Create .env.local file
Write-Host "[1/3] Creating .env.local file..." -ForegroundColor Yellow
if (-Not (Test-Path ".env.local")) {
    'NEXT_PUBLIC_API_URL=http://localhost:8000' | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✓ .env.local file created" -ForegroundColor Green
} else {
    Write-Host "✓ .env.local file already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "`n[2/3] Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Frontend Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the development server, run:" -ForegroundColor Yellow
Write-Host "    npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
