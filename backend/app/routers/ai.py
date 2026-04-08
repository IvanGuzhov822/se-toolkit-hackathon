from fastapi import APIRouter
from app.schemas.ai import AICheckRequest, AICheckResponse

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/check-priority", response_model=AICheckResponse)
async def check_priority(payload: AICheckRequest):
    """
    V1: Rule-based priority check without LLM.
    V2: Will integrate OpenAI API for contextual analysis.
    """
    messages = []

    if payload.old_important and not payload.new_important:
        messages.append(
            f"You previously considered \"{payload.task_title}\" important. "
            f"Are you sure you want to downgrade its priority?"
        )
    elif not payload.old_important and payload.new_important:
        messages.append(
            f"You've upgraded \"{payload.task_title}\" to important. "
            f"Make sure this aligns with your key priorities."
        )

    if payload.old_deadline != payload.new_deadline:
        if payload.old_deadline and payload.new_deadline:
            if payload.new_deadline > payload.old_deadline:
                messages.append(
                    f"You pushed the deadline from {payload.old_deadline} to {payload.new_deadline}. "
                    f"Remember: Q2 tasks (important, not urgent) can easily become Q1 crises."
                )

    if messages:
        return AICheckResponse(
            ai_message=" ".join(messages),
            confidence=0.7,
        )

    return AICheckResponse(
        ai_message="",
        confidence=0.0,
    )
