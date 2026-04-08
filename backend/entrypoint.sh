#!/bin/bash
set -e

echo "🔄 Running database migrations..."
alembic upgrade head

echo "🌱 Seeding Covey quotes..."
python -c "
from app.services.quote_service import seed_quotes
import asyncio
asyncio.run(seed_quotes())
" 2>/dev/null || echo "⚠️  Quote seeding skipped (table may not exist yet)"

echo "🚀 Starting CoveyWeek server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
