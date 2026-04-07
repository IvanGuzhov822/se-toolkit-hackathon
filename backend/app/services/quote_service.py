from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.quote import Quote
from app.database import async_session

# Verified quotes from "The 7 Habits of Highly Effective People" by Stephen R. Covey
# Source: book text, FranklinCovey official, Bookroo
COVEY_QUOTES = [
    # General / Character
    ("What we are communicates far more eloquently than anything we say or do.", "general"),
    ("Making and keeping promises to ourselves precedes making and keeping promises to others.", "general"),
    ("Principles are guidelines for human conduct that are proven to have enduring, permanent value.", "general"),

    # Habit 1: Be Proactive
    ("If I really want to improve my situation, I can work on the one thing over which I have control — myself.", "Q2"),
    ("As human beings, we are responsible for our own lives. Our behavior is a function of our decisions, not our conditions.", "Q2"),
    ("What matters most is how we respond to what we experience in life.", "Q2"),

    # Habit 2: Begin with the End in Mind
    ("Sow a thought, reap an action; sow an action, reap a habit; sow a habit, reap a character; sow a character, reap a destiny.", "Q2"),
    ("No one can persuade another to change. Each of us guards a gate of change that can only be opened from the inside.", "Q2"),

    # Habit 3: Put First Things First (Time Management / Quadrants)
    ("The key is not to prioritize what's on your schedule, but to schedule your priorities.", "Q2"),
    ("Effective leadership is putting first things first. Effective management is discipline, carrying it out.", "Q1"),
    ("The more people are into quick fix and focus on the acute problems and pain, the more that very approach contributes to the underlying chronic condition.", "Q2"),
    ("Many people wait for something to happen or someone to take care of them. But proactive people are solutions to problems, not problems themselves.", "Q1"),

    # Habit 4: Think Win-Win
    ("If you want to have a happy marriage, be the kind of person who generates positive energy and sidesteps negative energy.", "general"),
    ("If you want to be trusted, be trustworthy.", "general"),

    # Habit 5: Seek First to Understand
    ("Most people do not listen with the intent to understand; they listen with the intent to reply.", "general"),
    ("To relate effectively with others, we must learn to listen. And this requires emotional strength.", "general"),

    # Habit 6: Synergize
    ("The whole is greater than the sum of its parts.", "general"),

    # Habit 7: Sharpen the Saw
    ("We must never become too busy sawing to take time to sharpen the saw.", "Q2"),
]


async def seed_quotes():
    """Insert Covey quotes into the database if they don't exist."""
    async with async_session() as session:
        result = await session.execute(select(Quote))
        existing = result.scalars().all()
        if existing:
            print(f"Quotes already seeded ({len(existing)} quotes found).")
            return

        for text, tag in COVEY_QUOTES:
            session.add(Quote(text=text, quadrant_tag=tag))

        await session.commit()
        print(f"Seeded {len(COVEY_QUOTES)} Covey quotes.")
