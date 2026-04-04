import React from 'react'

interface HeaderProps {
  weekStart: string
  weekEnd: string
  onAddTask: () => void
}

const Header: React.FC<HeaderProps> = ({ weekStart, weekEnd, onAddTask }) => {
  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">CoveyWeek</h1>
        <span className="text-sm text-gray-500">
          {formatDate(weekStart)} — {formatDate(weekEnd)}
        </span>
      </div>
      <button
        onClick={onAddTask}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        + Add Task
      </button>
    </header>
  )
}

export default Header
