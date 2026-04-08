import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)


async def ai_check_priority_change(task_title: str, new_quadrant: str, past_tasks: list[dict]) -> str:
    """
    Uses LLM to find similar tasks and generate a warning.
    past_tasks = [{'title': 'Task A', 'quadrant': 'Q1'}, ...]
    """
    if not getattr(settings, 'USE_LLM', False):
        return None

    proxy_url = getattr(settings, 'QWEN_PROXY_URL', '')
    if not proxy_url:
        return None

    # Формируем список истории для промпта
    history_text = "\n".join([f"- {t['title']} (Priority: {t['quadrant']})" for t in past_tasks])

    prompt = (
        f"I am creating a task called '{task_title}' with priority '{new_quadrant}'. "
        f"Here are my past tasks:\n{history_text}\n\n"
        f"1. Identify if any past task is semantically similar to '{task_title}' (even if worded differently) "
        f"AND has a DIFFERENT priority.\n"
        f"2. If found, write a short, helpful warning (2 sentences max) in English. "
        f"Example: 'Similar task \"Study Math\" was Q1, now you set this as Q4. Are you sure?'\n"
        f"3. If nothing similar found or priority matches, reply ONLY with the word: 'OK'."
    )

    try:
        headers = {"Content-Type": "application/json"}
        if settings.QWEN_API_KEY:
            headers["Authorization"] = f"Bearer {settings.QWEN_API_KEY}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{settings.QWEN_PROXY_URL}/chat/completions",
                json={
                    "model": "qwen3-coder-plus",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 100,
                    "temperature": 0.3
                },
                headers=headers
            )

            if response.status_code != 200:
                logger.warning(f"LLM returned status {response.status_code}: {response.text[:200]}")
                return None

            data = response.json()
            result = data["choices"][0]["message"]["content"].strip()

            # Если LLM не нашел совпадений (вернул OK), то предупреждения нет
            if result.upper() == "OK":
                return None
            return result
    except httpx.HTTPStatusError as e:
        logger.warning(f"LLM HTTP error ({e.response.status_code}): {e.response.text[:200]}")
        return None
    except httpx.RequestError as e:
        logger.warning(f"LLM request failed ({e})")
        return None
    except (KeyError, ValueError) as e:
        logger.warning(f"LLM response parsing failed ({e})")
        return None
    except Exception as e:
        logger.warning(f"LLM unavailable ({e}), fallback to basic check.")
        return None
