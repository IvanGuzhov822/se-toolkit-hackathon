from datetime import date, timedelta


# Covey quadrant codes
Q1 = "Q1"  # Urgent + Important     → Do First
Q2 = "Q2"  # Not Urgent + Important → Schedule
Q3 = "Q3"  # Urgent + Not Important → Delegate
Q4 = "Q4"  # Not Urgent + Not Important → Eliminate

QUADRANT_ORDER = {Q1: 1, Q2: 2, Q3: 3, Q4: 4}

URGENCY_THRESHOLD_DAYS = 2  # deadline within 2 days = urgent


def calculate_quadrant(is_important: bool, deadline: date | None) -> str:
    """
    Determine Covey quadrant based on importance and deadline.

    - Important + deadline soon (≤ 2 days or today) → Q1
    - Important + no deadline / far → Q2
    - Not important + deadline soon → Q3
    - Not important + no deadline / far → Q4
    """
    today = date.today()
    is_urgent = False

    if deadline is not None:
        days_until = (deadline - today).days
        is_urgent = days_until <= URGENCY_THRESHOLD_DAYS

    if is_important and is_urgent:
        return Q1
    elif is_important and not is_urgent:
        return Q2
    elif not is_important and is_urgent:
        return Q3
    else:
        return Q4
