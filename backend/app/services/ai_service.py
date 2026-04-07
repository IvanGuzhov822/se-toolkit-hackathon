import logging

logger = logging.getLogger(__name__)


async def ai_check_priority_change(
    task_title: str,
    new_priority: str,
    similar_task_title: str,
    old_priority: str,
) -> str:
    """
    Check if priority choice differs from similar past task.
    Currently uses rule-based fallback (LLM disabled due to university VM restrictions).
    
    To enable LLM on university VMs:
    1. Set up qwen-code-api proxy on port 42005
    2. Set USE_LLM=true and QWEN_PROXY_URL=http://localhost:42005/v1 in .env
    """
    # LLM integration is ready — just enable in .env
    # For now, always use rule-based fallback
    return _rule_based_warning(task_title, new_priority, similar_task_title, old_priority)


def _rule_based_warning(
    task_title: str,
    new_priority: str,
    similar_task_title: str,
    old_priority: str,
) -> str:
    """Generate a warning when priority differs from similar past task."""
    return (
        f"You previously marked \"{similar_task_title}\" as {old_priority}. "
        f"Now you're setting \"{task_title}\" as {new_priority}. "
        f"Are you sure about this change?"
    )


def find_similar_task_title(
    title: str,
    existing_titles: list[str],
    threshold: float = 0.5,
) -> str | None:
    """
    Find the most similar existing task title.
    Uses a simple word-overlap heuristic (Jaccard similarity).
    """
    if not existing_titles:
        return None

    title_words = set(_normalize(title))
    best_score = 0.0
    best_title = None

    for existing in existing_titles:
        existing_words = set(_normalize(existing))
        if not title_words or not existing_words:
            continue
        overlap = len(title_words & existing_words)
        union = len(title_words | existing_words)
        score = overlap / union if union > 0 else 0
        if score > best_score and score >= threshold:
            best_score = score
            best_title = existing

    return best_title


def _normalize(text: str) -> list[str]:
    """Lowercase, remove punctuation and short words."""
    import re
    return [w for w in re.findall(r'\w+', text.lower()) if len(w) >= 3]
