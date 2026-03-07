#!/bin/bash
# ==========================================================
# Commons by Codezela — Local Setup Script
# ==========================================================
# Prerequisites: PostgreSQL installed and running locally.
#   macOS:  brew install postgresql@17 && brew services start postgresql@17
#   Linux:  sudo apt install postgresql && sudo systemctl start postgresql
#
# Usage:
#   chmod +x scripts/setup-local.sh
#   ./scripts/setup-local.sh
# ==========================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "🚀 Commons by Codezela — Local Setup"
echo "======================================"
echo ""

# --- 1. Check PostgreSQL ---
if ! command -v psql &>/dev/null; then
  echo "❌ psql not found. Install PostgreSQL first:"
  echo "   macOS:  brew install postgresql@17 && brew services start postgresql@17"
  echo "   Linux:  sudo apt install postgresql && sudo systemctl start postgresql"
  exit 1
fi

if ! pg_isready -q 2>/dev/null; then
  echo "❌ PostgreSQL is not running. Start it first:"
  echo "   macOS:  brew services start postgresql@17"
  echo "   Linux:  sudo systemctl start postgresql"
  exit 1
fi

echo "✅ PostgreSQL is running"

# --- 2. Create database if not exists ---
if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw commons; then
  echo "✅ Database 'commons' already exists"
else
  echo "⏳ Creating database 'commons'..."
  createdb commons 2>/dev/null || psql -U postgres -c "CREATE DATABASE commons;" 2>/dev/null || {
    echo "❌ Could not create database. Try manually:"
    echo "   createdb commons"
    exit 1
  }
  echo "✅ Database 'commons' created"
fi

# --- 3. Ensure .env.local exists ---
ENV_FILE="$PROJECT_DIR/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "⏳ Creating .env.local from .env.example..."
  cp "$PROJECT_DIR/.env.example" "$ENV_FILE"

  # Auto-detect local PG connection (try common defaults)
  # Try passwordless first (macOS default), then postgres:postgres
  if psql -d commons -c "SELECT 1" &>/dev/null; then
    LOCAL_URL="postgresql://localhost:5432/commons"
  elif psql -U postgres -d commons -c "SELECT 1" &>/dev/null; then
    LOCAL_URL="postgresql://postgres:postgres@localhost:5432/commons"
  else
    LOCAL_URL="postgresql://postgres:postgres@localhost:5432/commons"
  fi

  # Patch the .env.local with the detected URL
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^DATABASE_URL_LOCAL=.*|DATABASE_URL_LOCAL=$LOCAL_URL|" "$ENV_FILE"
  else
    sed -i "s|^DATABASE_URL_LOCAL=.*|DATABASE_URL_LOCAL=$LOCAL_URL|" "$ENV_FILE"
  fi

  # Generate a random auth secret
  AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$AUTH_SECRET|" "$ENV_FILE"
  else
    sed -i "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$AUTH_SECRET|" "$ENV_FILE"
  fi

  echo "✅ .env.local created with auto-detected local PG URL"
else
  echo "✅ .env.local already exists"
fi

# --- 4. Install dependencies ---
echo "⏳ Installing dependencies..."
cd "$PROJECT_DIR"
npm install --silent 2>&1 | tail -3
echo "✅ Dependencies installed"

# --- 5. Push schema ---
echo "⏳ Pushing database schema..."
npm run db:push
echo ""

# --- 6. Done ---
echo "======================================"
echo "✅ Local setup complete!"
echo ""
echo "   Start the dev server:  npm run dev"
echo ""
echo "   Then seed the admin user in another terminal:"
echo "     npm run db:seed"
echo ""
echo "   Or visit: http://localhost:3000/api/seed  (POST)"
echo ""
echo "   Login with:"
echo "     Email:    info@codezela.com"
echo "     Password: password"
echo "======================================"
echo ""
