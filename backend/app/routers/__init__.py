from app.routers.tasks import router as tasks_router
from app.routers.weeks import router as weeks_router
from app.routers.quotes import router as quotes_router
from app.routers.ai import router as ai_router

__all__ = ["tasks_router", "weeks_router", "quotes_router", "ai_router"]
