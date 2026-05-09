# Local Deployment Script (Windows PowerShell)
$IMAGE_NAME = "sahiladvani/foodlens-backend"
$TAG = "latest"

Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t "$IMAGE_NAME:$TAG" .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful. Pushing to Docker Hub..." -ForegroundColor Green
    docker push "$IMAGE_NAME:$TAG"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Push successful!" -ForegroundColor Green
    } else {
        Write-Host "Push failed. Are you logged in? (docker login)" -ForegroundColor Red
    }
} else {
    Write-Host "Build failed." -ForegroundColor Red
}
