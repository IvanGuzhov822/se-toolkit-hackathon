import asyncio
from sqlalchemy import delete
from app.database import async_session
from app.models.quote import Quote
from app.services.quote_service import seed_quotes


async def refresh_quotes():
    async with async_session() as s:
        result = await s.execute(delete(Quote))
        await s.commit()
        print(f"Cleared {result.rowcount} old quotes.")
    await seed_quotes()


asyncio.run(refresh_quotes())
