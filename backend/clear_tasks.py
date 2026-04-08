import asyncio
from sqlalchemy import delete
from app.database import async_session
from app.models.task import Task


async def clear():
    async with async_session() as s:
        result = await s.execute(delete(Task))
        await s.commit()
        print(f"Cleared {result.rowcount} tasks.")


asyncio.run(clear())
