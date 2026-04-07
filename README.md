# CoveyWeek

A principle-driven weekly planner inspired by Stephen Covey's *7 Habits of Highly Effective People*.

---

## Screenshots

### Weekly View with Covey Matrix
![Weekly View](https://placehold.co/800x400/e2e8f0/1e293b?text=Weekly+Calendar+View+with+Q1-Q4+Color+Coding)

### Add Task Dialog
![Add Task](https://placehold.co/400x300/f1f5f9/1e293b?text=Add+Task+Form)

---

## Context

### End Users
Students and young professionals who want to manage their time based on principles, not just urgency.

### Problem
Most task managers sort tasks by deadline alone, causing people to confuse **urgent** with **important**. This leads to burnout and neglect of long-term goals (Covey's Quadrant II).

### Our Solution
CoveyWeek places every task into one of four quadrants:
1. **Q1 — Do First** (Urgent + Important)
2. **Q2 — Schedule** (Important, Not Urgent)
3. **Q3 — Delegate** (Urgent, Not Important)
4. **Q4 — Eliminate** (Not Urgent, Not Important)

Tasks are displayed on a weekly timeline grid, sorted by quadrant priority.

---

## Features

### ✅ Implemented (Version 1)
- **User Authentication** — Register/Login with JWT tokens (7-day expiry)
- **Sleep Schedule** — Set your sleep/wake hours during registration; tasks are never scheduled during sleep
- **Auto-scheduling** — Tasks placed by Covey quadrant priority (Q1→Q4), stacking within awake hours
- **Overflow to next day** — If a day is full, tasks automatically move to the next available day
- **Create, edit, delete tasks** with importance toggle, deadline toggle, duration
- **Weekly calendar view** (Mon–Sun) with 15-minute time slots
- **Color-coded tasks** by quadrant (red/blue/amber/gray)
- **Random Covey quotes banner** (18 verified quotes from the book)
- **Week navigation** — previous/next week + "Today" button
- **AI-powered priority-change detection** (rule-based in V1, LLM in V2)

### 🔜 Planned (Version 2)
- Telegram bot for quick task management
- Full LLM integration for contextual priority analysis
- Task history and pattern insights
- Mobile-responsive PWA improvements

---

## Usage

1. Open the app in your browser
2. **Register** with a username, password, and your sleep schedule
3. **Create tasks** — set importance, optional deadline, and duration
4. The system **auto-schedules** each task based on:
   - **Covey quadrant** (Q1 first at 08:00, Q2 at 10:00, Q3 at 15:00, Q4 at 18:00)
   - **Your sleep hours** — no tasks during sleep
   - **Existing tasks** — stacking within each quadrant
   - **Overflow** — if a day is full, tasks move to the next day
5. Navigate between weeks with `‹` / `›` buttons
6. Click a task to edit, click `✕` to delete

---

## Deployment

### OS Requirements
Ubuntu 24.04 (or any Linux with Docker support)

### What Should Be Installed
```bash
# Install Docker and Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

### Step-by-Step Deployment

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/se-toolkit-hackathon.git
cd se-toolkit-hackathon

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Run database migrations
docker-compose exec backend alembic upgrade head

# 5. Seed Covey quotes
docker-compose exec backend python -c "from app.services.quote_service import seed_quotes; import asyncio; asyncio.run(seed_quotes())"

# 6. Open in browser
# Frontend: http://localhost:5173
# Backend API docs: http://localhost:8000/docs
```

### Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React weekly planner UI |
| Backend | http://localhost:8000 | FastAPI REST API |
| API Docs | http://localhost:8000/docs | Swagger UI |
| PostgreSQL | localhost:5432 | Database |

### Stopping the App
```bash
docker-compose down
```

### Resetting Everything
```bash
docker-compose down -v
docker-compose up -d
```
