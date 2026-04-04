import React from 'react'
import { Task } from '../types'
import { timeToMinutes, minutesToRow, getQuadrantInfo, TOTAL_SLOTS } from '../utils/timeHelpers'

interface DayColumnProps {
  date: string
  dayName: string
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const ROW_HEIGHT_REM = 1.5 // each 15-min slot = 1.5rem

const DayColumn: React.FC<DayColumnProps> = ({ date, dayName, tasks, onEdit, onDelete }) => {
  const isToday = (() => {
    const today = new Date()
    const d = new Date(date + 'T00:00:00')
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    )
  })()

  // Highlight the current time if today
  const currentHour = new Date().getHours()
  const currentMin = new Date().getMinutes()
  const currentRow = minutesToRow(currentHour * 60 + currentMin)

  return (
    <div className={`flex-1 min-w-0 border-r border-gray-200 relative ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}>
      {/* Day header */}
      <div className={`sticky top-0 z-10 px-2 py-1.5 text-center border-b border-gray-200 font-medium text-sm ${isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
        <div>{dayName}</div>
        <div className="text-xs text-gray-400">{new Date(date + 'T00:00:00').getDate()}</div>
      </div>

      {/* Time grid */}
      <div className="relative" style={{ height: `${TOTAL_SLOTS * ROW_HEIGHT_REM}rem` }}>
        {/* Horizontal grid lines (every 15 min) */}
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-b"
            style={{
              top: `${i * ROW_HEIGHT_REM}rem`,
              height: `${ROW_HEIGHT_REM}rem`,
              borderColor: i % 4 === 0 ? '#e5e7eb' : '#f9fafb', // darker on the hour
            }}
          />
        ))}

        {/* Current time indicator (red line) */}
        {isToday && (
          <div
            className="absolute left-0 right-0 z-5 pointer-events-none"
            style={{ top: `${currentRow * ROW_HEIGHT_REM}rem` }}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 -mt-1" />
            <div className="h-0.5 bg-red-500 w-full" />
          </div>
        )}

        {/* Task blocks */}
        {tasks.map((task) => {
          const startMinutes = timeToMinutes(task.start_time)
          const topRow = minutesToRow(startMinutes)
          const topRem = topRow * ROW_HEIGHT_REM
          const heightRem = Math.max((task.duration_min / 15) * ROW_HEIGHT_REM, ROW_HEIGHT_REM)
          const info = getQuadrantInfo(task.quadrant)

          return (
            <div
              key={task.id}
              className={`absolute left-0.5 right-0.5 mx-0.5 rounded px-1.5 py-0.5 border-l-2 text-[11px] cursor-pointer hover:shadow-md transition-shadow group overflow-hidden ${info.color}`}
              style={{ top: `${topRem}rem`, height: `${heightRem}rem` }}
              onClick={() => onEdit(task)}
              title={`${task.title} (${task.duration_min} min)`}
            >
              <div className="font-semibold text-gray-800 truncate leading-tight">
                {task.title}
              </div>
              {heightRem >= 3 && (
                <div className="text-gray-500 text-[9px] mt-0.5">
                  {task.start_time} · {task.duration_min}m
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(task.id)
                }}
                className="absolute top-0.5 right-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DayColumn
