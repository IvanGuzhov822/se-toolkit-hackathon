import React from 'react'
import { useStore } from '../store/taskStore'
import { useAuth } from '../store/authStore'

interface HeaderProps {
  weekStart: string
  weekEnd: string
  onAddTask: () => void
}

const Header: React.FC<HeaderProps> = ({ weekStart, weekEnd, onAddTask }) => {
  const weekOffset = useStore((s) => s.weekOffset)
  const setWeekOffset = useStore((s) => s.setWeekOffset)
  const username = useAuth((s) => s.username)
  const clearAuth = useAuth((s) => s.clearAuth)

  const formatDate = (d: string) => {
    if (!d) return ''
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Always show the actual date range from the fetched week data
  // The label is just a helper — the real sync is via weekStart/weekEnd
  const weekLabel = (() => {
    if (weekOffset === 0) return 'This Week'
    if (weekOffset === -1) return 'Previous Week'
    if (weekOffset === 1) return 'Next Week'
    return `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`
  })()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">CoveyWeek</h1>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all"
            title="Previous week"
          >
            ‹
          </button>
          <span className="text-xs text-gray-500 w-24 text-center">
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all"
            title="Next week"
          >
            ›
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              title="Back to current week"
            >
              Today
            </button>
          )}
        </div>
        {/* Always show the actual date range from the fetched week */}
        <span className="text-sm text-gray-500 hidden sm:inline font-medium">
          {weekStart ? `${formatDate(weekStart)} — ${formatDate(weekEnd)}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm text-gray-600">👤 {username}</span>
        <button
          onClick={onAddTask}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Task
        </button>
        <button
          onClick={clearAuth}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          title="Sign out"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}

export default Header
