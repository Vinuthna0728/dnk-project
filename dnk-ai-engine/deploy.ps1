Write-Host "🚀 Building and deploying DNK AI Engine Stack..." -ForegroundColor Green

# 1. Take down existing containers and build fresh images
docker compose down
docker compose build --no-cache
docker compose up -d

Write-Host "⏳ Waiting for service startup..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# 2. Seed ITC-HS Code vectors into Qdrant inside container
Write-Host "📦 Seeding ITC-HS Code vectors into Qdrant..." -ForegroundColor Cyan

# Note: Using 'docker exec -i' (without 't') prevents TTY error issues in PowerShell scripts
docker exec -i dnk_ai_engine python -m scripts.ingest_hs_codes

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "📍 API Docs available at: http://localhost:8000/docs" -ForegroundColor White