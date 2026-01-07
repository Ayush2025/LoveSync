# LoveSync - AI Companion Platform

## Prerequisites

- **Node.js** (v20 or higher recommended)
- **PostgreSQL Database** (or a Neon Database connection string)
- **npm** (comes with Node.js)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=your_postgresql_connection_string_here
GROQ_API_KEY=your_groq_api_key_here (optional, has a default)
```

**Getting a Database URL:**
- You can use [Neon Database](https://neon.tech) (free tier available) for a serverless PostgreSQL database
- Or set up a local PostgreSQL database and use: `postgresql://username:password@localhost:5432/database_name`

**Getting a Groq API Key:**
- Sign up at [Groq](https://console.groq.com) to get an API key
- This is optional as the project has a default key, but you should use your own for production

### 3. Set Up the Database Schema

Run the database migrations to create the required tables:

```bash
npm run db:push
```

### 4. Run the Development Server

**On Windows (PowerShell):**
```powershell
$env:NODE_ENV="development"; npm run dev
```

**On Windows (Command Prompt):**
```cmd
set NODE_ENV=development && npm run dev
```

**On Linux/Mac:**
```bash
npm run dev
```

The application will be available at: **http://localhost:5000**

## Available Scripts

- `npm run dev` - Start the development server (with hot reload)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server (requires build first)
- `npm run check` - Type check the TypeScript code
- `npm run db:push` - Push database schema changes to your database

## Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared TypeScript types and database schema
- `/attached_assets` - Image assets for the application

## Features

- AI-powered companion chat with multiple personalities
- Real-time audio call functionality
- Multi-language support (English, Hindi, Hinglish)
- Persistent chat memory
- User authentication
- Roleplay adventures system

## Troubleshooting

**Port 5000 already in use:**
- Change the port in `server/index.ts` (line 62) or stop the process using port 5000

**Database connection errors:**
- Verify your `DATABASE_URL` is correct
- Ensure your database is accessible
- Check if you've run `npm run db:push` to set up the schema

**Module not found errors:**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set `NODE_ENV=production` and start:
   ```bash
   npm run start
   ```

Make sure your production environment has the `DATABASE_URL` environment variable set.


