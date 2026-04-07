import React from 'react'
import { Task } from '../types'
import { timeToMinutes, minutesToRow, getQuadrantInfo, TOTAL_SLOTS } from '../utils/timeHelpers'

interface DayColumnProps {
  date: string
  dayName: string
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  sleepStart: string
  sleepEnd: string
}

const ROW_HEIGHT_REM = 1.5

const DayColumn: React.FC<DayColumnProps> = ({ date, dayName, tasks, onEdit, onDelete, sleepStart, sleepEnd }) => {
  const isToday = (() => {
    const today = new Date()
    const d = new Date(date + 'T00:00:00')
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  })()

  const currentHour = new Date().getHours()
  const currentMin = new Date().getMinutes()
  const currentRow = minutesToRow(currentHour * 60 + currentMin)

  // Calculate sleep zone
  const sleepStartMin = timeToMinutes(sleepStart)
  const sleepEndMin = timeToMinutes(sleepEnd)
  const sleepStartRow = minutesToRow(sleepStartMin)
  const sleepEndRow = minutesToRow(sleepEndMin)

  // Build sleep zone ranges (could be split if overnight)
  const sleepZones: { top: number; height: number }[] = []
  if (sleepStartMin > sleepEndMin) {
    // Overnight: 23:00 → 00:00 + 00:00 → 07:00
    if (sleepStartRow < TOTAL_SLOTS) {
      sleepZones.push({
        top: sleepStartRow * ROW_HEIGHT_REM,
        height: (TOTAL_SLOTS - sleepStartRow) * ROW_HEIGHT_REM,
      })
    }
    if (sleepEndRow > 0) {
      sleepZones.push({
        top: 0,
        height: sleepEndRow * ROW_HEIGHT_REM,
      })
    }
  } else {
    // Same day
    sleepZones.push({
      top: sleepStartRow * ROW_HEIGHT_REM,
      height: (sleepEndRow - sleepStartRow) * ROW_HEIGHT_REM,
    })
  }

  return (
    <div className="flex-1 min-w-0 border-r border-gray-100 relative bg-white">
      {/* Day header — sticky */}
      <div className={`sticky top-0 z-10 px-2 py-1.5 text-center border-b border-gray-200 font-semibold text-sm ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
        <div>{dayName}</div>
        <div className={`text-xs ${isToday ? 'text-blue-200' : 'text-gray-400'}`}>{new Date(date + 'T00:00:00').getDate()}</div>
      </div>

      {/* Time grid */}
      <div className="relative" style={{ height: `${TOTAL_SLOTS * ROW_HEIGHT_REM}rem` }}>
        {/* Horizontal grid lines */}
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-b"
            style={{
              top: `${i * ROW_HEIGHT_REM}rem`,
              height: `${ROW_HEIGHT_REM}rem`,
              borderColor: i % 4 === 0 ? '#e5e7eb' : '#f9fafb',
            }}
          />
        ))}

        {/* Sleep zone overlay */}
        {sleepZones.map((zone, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 bg-indigo-100/60 border-y border-indigo-200/40 flex items-center justify-center"
            style={{ top: `${zone.top}rem`, height: `${zone.height}rem` }}
          >
            {zone.height > 3 && (
              <span className="text-[9px] text-indigo-300 font-medium select-none">😴 Sleep</span>
            )}
          </div>
        ))}

        {/* Current time indicator */}
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
              className={`absolute left-0.5 right-0.5 mx-0.5 rounded px-2 py-1 cursor-pointer hover:shadow-md transition-shadow group overflow-hidden ${info.color}`}
              style={{
                top: `${topRem}rem`,
                height: `${heightRem}rem`,
                borderLeftWidth: '3px',
              }}
              onClick={() => onEdit(task)}
              title={`${task.title} (${task.duration_min} min) — click to edit`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
                className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded bg-white/80 hover:bg-red-500 hover:text-white text-gray-400 transition-colors text-[10px] font-bold z-10"
                title="Delete"
              >
                ✕
              </button>
              <div className="font-bold text-gray-800 truncate leading-tight pr-5" style={{ fontSize: '13px' }}>
                {task.title}
              </div>
              {heightRem >= 3 && (
                <div className="text-gray-500 text-[10px] mt-0.5 font-medium">
                  {task.start_time.slice(0, 5)} · {task.duration_min}m
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DayColumn
