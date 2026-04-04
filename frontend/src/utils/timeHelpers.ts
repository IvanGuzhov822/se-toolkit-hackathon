/**
 * Convert minutes from midnight to a grid row number (15-min slots).
 * 00:00 → row 0, 00:15 → row 1, ..., 23:45 → row 95
 */
export function minutesToRow(minutesFromMidnight: number): number {
  return Math.floor(minutesFromMidnight / 15)
}

/**
 * Total number of 15-min slots in a day.
 */
export const TOTAL_SLOTS = 96

/**
 * Parse "HH:MM" time string to minutes from midnight.
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

/**
 * Format minutes from midnight back to "HH:MM".
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Get all 96 time slot labels for the day (00:00 to 23:45, every 15 min).
 * Only shows label on the hour (e.g. 09:00) to avoid crowding.
 */
export function getTimeSlots(): string[] {
  const slots: string[] = []
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const mins = i * 15
    const h = Math.floor(mins / 60)
    const m = mins % 60
    // Only show label on the hour, hide 15/30/45
    slots.push(m === 0 ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` : '')
  }
  return slots
}

/**
 * Get quadrant display info.
 */
export function getQuadrantInfo(quadrant: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    Q1: { label: 'Do First', color: 'border-red-500 bg-red-100' },
    Q2: { label: 'Schedule', color: 'border-blue-500 bg-blue-100' },
    Q3: { label: 'Delegate', color: 'border-amber-500 bg-amber-100' },
    Q4: { label: 'Eliminate', color: 'border-gray-400 bg-gray-100' },
  }
  return map[quadrant] || { label: quadrant, color: 'border-gray-300 bg-gray-50' }
}
