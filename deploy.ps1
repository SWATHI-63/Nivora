# Build and Deploy Script for Nivora PWA

Write-Host "🚀 Building and Deploying Nivora PWA" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the app
Write-Host ""
Write-Host "🔨 Building production app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Check if Netlify CLI is installed
$netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue

if (-not $netlifyInstalled) {
    Write-Host "📦 Netlify CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

Write-Host ""
Write-Host "🌐 Deploying to Netlify..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Choose deployment option:" -ForegroundColor Cyan
Write-Host "1. Deploy to production (--prod)" -ForegroundColor White
Write-Host "2. Deploy preview/draft" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    netlify deploy --prod
} else {
    netlify deploy
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Copy your deployed URL" -ForegroundColor White
    Write-Host "2. Test at: https://your-url.netlify.app" -ForegroundColor White
    Write-Host "3. Follow TWA_GOOGLE_PLAY_GUIDE.md to create Android app" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Try: netlify login" -ForegroundColor Yellow
}
