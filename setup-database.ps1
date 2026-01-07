# PostgreSQL Database Setup Script
# Run this script after installing PostgreSQL

Write-Host "Setting up PostgreSQL database for AI Companion..." -ForegroundColor Green

# Prompt for PostgreSQL password
$postgresPassword = Read-Host "Enter PostgreSQL 'postgres' user password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($postgresPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for this session
$env:PGPASSWORD = $plainPassword

# Database name
$dbName = "ai_companion"
$dbUser = "ai_companion_user"
$dbPassword = Read-Host "Enter password for new database user '$dbUser'" -AsSecureString
$BSTR2 = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
$plainDbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR2)

Write-Host "`nCreating database and user..." -ForegroundColor Yellow

# Find PostgreSQL bin directory (common locations)
$pgBinPaths = @(
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\Program Files (x86)\PostgreSQL\16\bin",
    "C:\Program Files (x86)\PostgreSQL\15\bin"
)

$psqlPath = $null
foreach ($path in $pgBinPaths) {
    if (Test-Path "$path\psql.exe") {
        $psqlPath = "$path\psql.exe"
        break
    }
}

if (-not $psqlPath) {
    Write-Host "ERROR: Could not find psql.exe. Please add PostgreSQL bin directory to PATH or run manually." -ForegroundColor Red
    Write-Host "`nManual steps:" -ForegroundColor Yellow
    Write-Host "1. Open pgAdmin 4"
    Write-Host "2. Connect to PostgreSQL server"
    Write-Host "3. Right-click 'Databases' -> Create -> Database"
    Write-Host "4. Name: $dbName"
    Write-Host "`nOr run these SQL commands in pgAdmin Query Tool:" -ForegroundColor Yellow
    Write-Host "CREATE DATABASE $dbName;"
    Write-Host "CREATE USER $dbUser WITH PASSWORD '$plainDbPassword';"
    Write-Host "GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;"
    exit 1
}

# Create database
& $psqlPath -U postgres -c "CREATE DATABASE $dbName;" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database '$dbName' created" -ForegroundColor Green
} else {
    Write-Host "Database might already exist, continuing..." -ForegroundColor Yellow
}

# Create user
& $psqlPath -U postgres -c "CREATE USER $dbUser WITH PASSWORD '$plainDbPassword';" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ User '$dbUser' created" -ForegroundColor Green
} else {
    Write-Host "User might already exist, continuing..." -ForegroundColor Yellow
}

# Grant privileges
& $psqlPath -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;" 2>&1 | Out-Null
Write-Host "✓ Privileges granted" -ForegroundColor Green

# Clear password from environment
Remove-Item Env:\PGPASSWORD

Write-Host "`n✓ Database setup complete!" -ForegroundColor Green
Write-Host "`nAdd this to your .env file:" -ForegroundColor Cyan
Write-Host "DATABASE_URL=postgresql://$dbUser`:$plainDbPassword@localhost:5432/$dbName" -ForegroundColor White






