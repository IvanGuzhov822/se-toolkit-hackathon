from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import random

from app.database import get_session
from app.models.quote import Quote

router = APIRouter(prefix="/api/quotes", tags=["quotes"])


@router.get("/random")
async def get_random_quote(session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Quote).where(Quote.is_active == True)
    )
    quotes = result.scalars().all()
    if not quotes:
        return {"text": "Begin with the end in mind. — Stephen Covey", "quadrant_tag": "general"}
    quote = random.choice(quotes)
    return {"text": quote.text, "quadrant_tag": quote.quadrant_tag}
