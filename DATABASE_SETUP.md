# Local PostgreSQL Database Setup Guide

## Option 1: Using the Setup Script (Easiest)

1. **Install PostgreSQL** (if not already installed):
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, remember the password you set for the `postgres` user
   - Default port: 5432

2. **Run the setup script**:
   ```powershell
   cd E:\three.js-master\three.js-master\zero-cost-ai-companion-main
   .\setup-database.ps1
   ```

3. **Follow the prompts** to create the database and user

4. **Copy the DATABASE_URL** from the script output to your `.env` file

---

## Option 2: Manual Setup with pgAdmin (GUI)

1. **Install PostgreSQL** (if not already installed):
   - Download from: https://www.postgresql.org/download/windows/
   - Make sure to install **pgAdmin 4** (included in the installer)

2. **Open pgAdmin 4**:
   - Launch from Start Menu
   - Enter the password you set during PostgreSQL installation

3. **Create a Database**:
   - Right-click on "Databases" in the left sidebar
   - Select "Create" → "Database"
   - Name: `ai_companion` (or any name you prefer)
   - Click "Save"

4. **Create a User** (optional but recommended):
   - Expand "Login/Group Roles" in the left sidebar
   - Right-click → "Create" → "Login/Group Role"
   - General tab: Name = `ai_companion_user`
   - Definition tab: Set a password
   - Privileges tab: Check "Can login?"
   - Click "Save"

5. **Grant Permissions**:
   - Right-click on your database → "Properties"
   - Go to "Security" tab
   - Click "Add" and select your user
   - Grant all privileges
   - Click "Save"

6. **Get Connection String**:
   ```
   postgresql://ai_companion_user:your_password@localhost:5432/ai_companion
   ```
   Or if using the default postgres user:
   ```
   postgresql://postgres:your_postgres_password@localhost:5432/ai_companion
   ```

---

## Option 3: Manual Setup with Command Line

1. **Install PostgreSQL** (if not already installed)

2. **Add PostgreSQL to PATH** (if not already):
   - Find PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\16\bin`)
   - Add it to your system PATH environment variable

3. **Open PowerShell** and run:

```powershell
# Set PostgreSQL password (replace with your actual password)
$env:PGPASSWORD = "your_postgres_password"

# Create database
psql -U postgres -c "CREATE DATABASE ai_companion;"

# Create user (optional)
psql -U postgres -c "CREATE USER ai_companion_user WITH PASSWORD 'your_user_password';"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ai_companion TO ai_companion_user;"

# Clear password from environment
Remove-Item Env:\PGPASSWORD
```

4. **Connection String**:
   ```
   postgresql://ai_companion_user:your_user_password@localhost:5432/ai_companion
   ```

---

## After Setup: Configure Your Project

1. **Create a `.env` file** in the project root with:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   GROQ_API_KEY=your_groq_api_key_here
   ```

2. **Run database migrations**:
   ```powershell
   npm run db:push
   ```

3. **Start the development server**:
   ```powershell
   $env:NODE_ENV="development"; npm run dev
   ```

---

## Troubleshooting

### "psql: command not found"
- PostgreSQL is not installed, or
- PostgreSQL bin directory is not in your PATH
- Solution: Install PostgreSQL or add `C:\Program Files\PostgreSQL\16\bin` to PATH

### "password authentication failed"
- Wrong password for the postgres user
- Solution: Use the password you set during PostgreSQL installation

### "database already exists"
- The database was already created
- Solution: Either use the existing database or drop it first:
  ```sql
  DROP DATABASE ai_companion;
  ```

### "connection refused" or "could not connect"
- PostgreSQL service is not running
- Solution: Start the PostgreSQL service:
  ```powershell
  Start-Service postgresql-x64-16  # Replace 16 with your version
  ```
  Or use Services app (services.msc) to start "postgresql-x64-16"

### Port 5432 already in use
- Another PostgreSQL instance is running
- Solution: Stop the other instance or use a different port

---

## Quick Test

Test your connection:
```powershell
psql -U postgres -d ai_companion -c "SELECT version();"
```

If this works, your database is set up correctly!






