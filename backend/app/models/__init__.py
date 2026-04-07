from app.models.user import User
from app.models.task import Task
from app.models.priority_history import PriorityHistory
from app.models.quote import Quote

Base = None

# Import Base from one of the models
from app.database import Base  # noqa: F401, E402

__all__ = ["User", "Task", "PriorityHistory", "Quote", "Base"]
