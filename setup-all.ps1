# Quick Start Script - Run Everything
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   OSINT RECONNAISSANCE PLATFORM - QUICK START      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Setting up Backend..." -ForegroundColor Yellow
Set-Location -Path "C:\Users\dell\OneDrive\Desktop\OSINT\backend"
& ".\setup.ps1"

Write-Host ""
Write-Host "📦 Setting up Frontend..." -ForegroundColor Yellow
Set-Location -Path "C:\Users\dell\OneDrive\Desktop\OSINT\frontend"
& ".\setup.ps1"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✓ SETUP COMPLETE!                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Backend (in new terminal):" -ForegroundColor Yellow
Write-Host "   cd C:\Users\dell\OneDrive\Desktop\OSINT\backend" -ForegroundColor White
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "   python main.py" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Frontend (in another terminal):" -ForegroundColor Yellow
Write-Host "   cd C:\Users\dell\OneDrive\Desktop\OSINT\frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Open your browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Read ETHICS.md before use!" -ForegroundColor Red
Write-Host ""
