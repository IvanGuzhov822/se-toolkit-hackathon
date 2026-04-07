from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import tasks_router, weeks_router, quotes_router, ai_router
from app.routers.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Migrations and seeding are done in entrypoint.sh
    yield


app = FastAPI(
    title="CoveyWeek",
    description="A principle-driven weekly planner inspired by Stephen Covey's 7 Habits.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(weeks_router)
app.include_router(quotes_router)
app.include_router(ai_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "CoveyWeek Backend"}
