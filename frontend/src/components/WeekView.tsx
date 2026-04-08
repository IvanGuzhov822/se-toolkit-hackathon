import React from 'react'
import { useWeek } from '../hooks'
import DayColumn from './DayColumn'
import { useStore } from '../store/taskStore'
import { Task } from '../types'
import { TOTAL_SLOTS } from '../utils/timeHelpers'

const ROW_HEIGHT_REM = 1.5 // each 15-min slot = 1.5rem

const WeekView: React.FC = () => {
  const { week, loading, error } = useWeek()
  const setEditingTask = useStore((s) => s.setEditingTask)
  const removeTask = useStore((s) => s.removeTask)

  const handleEdit = (task: Task) => {
    setEditingTask(task)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this task?')) {
      await removeTask(id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading your week...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (!week) return null

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Time labels column */}
      <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-gray-50">
        <div className="h-10 border-b border-gray-200 bg-gray-100" />
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
          const hour = Math.floor(i / 4)
          const min = (i % 4) * 15
          const showLabel = min === 0
          return (
            <div
              key={i}
              className="flex items-start justify-end pr-2 text-[10px] text-gray-400"
              style={{ height: `${ROW_HEIGHT_REM}rem` }}
            >
              {showLabel ? `${String(hour).padStart(2, '0')}:00` : ''}
            </div>
          )
        })}
      </div>

      {/* Day columns */}
      <div className="flex-1 flex overflow-x-auto">
        {week.days.map((day) => (
          <DayColumn
            key={day.day_date}
            date={day.day_date}
            dayName={day.day_name}
            tasks={day.tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default WeekView
