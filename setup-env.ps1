# Environment Setup Script
# This script helps you create the .env file for the project

Write-Host "=== AI Companion Environment Setup ===" -ForegroundColor Green
Write-Host ""

# Check if .env already exists
if (Test-Path .env) {
    $overwrite = Read-Host ".env file already exists. Overwrite? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Skipping .env creation. Using existing file." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Enter your database connection details:" -ForegroundColor Cyan
Write-Host ""

# Get database details
$dbUser = Read-Host "Database username (e.g., postgres or ai_companion_user)"
$dbPassword = Read-Host "Database password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$dbName = Read-Host "Database name (e.g., ai_companion)"
$dbHost = Read-Host "Database host (default: localhost)" 
if ([string]::IsNullOrWhiteSpace($dbHost)) {
    $dbHost = "localhost"
}

$dbPort = Read-Host "Database port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) {
    $dbPort = "5432"
}

# Construct DATABASE_URL
$databaseUrl = "postgresql://${dbUser}:${plainPassword}@${dbHost}:${dbPort}/${dbName}"

Write-Host ""
Write-Host "Groq API Key (optional - press Enter to skip and use default):" -ForegroundColor Cyan
$groqKey = Read-Host "GROQ_API_KEY"

# Create .env file
$envContent = @"
# Database Configuration
DATABASE_URL=$databaseUrl

# Groq API Key (optional - has a default but you should use your own)
GROQ_API_KEY=$groqKey
"@

$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✓ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run db:push" -ForegroundColor White
Write-Host "2. Run: " -NoNewline -ForegroundColor White; Write-Host '$env:NODE_ENV="development"; npm run dev' -ForegroundColor Cyan

