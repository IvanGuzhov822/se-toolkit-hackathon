import React, { useRef, useEffect } from 'react'
import { useWeek } from '../hooks'
import DayColumn from './DayColumn'
import { useStore } from '../store/taskStore'
import { useAuth } from '../store/authStore'
import { Task } from '../types'
import { TOTAL_SLOTS, timeToMinutes, minutesToRow } from '../utils/timeHelpers'

const ROW_HEIGHT_REM = 1.5

const WeekView: React.FC = () => {
  const { week, loading, error } = useWeek()
  const setEditingTask = useStore((s) => s.setEditingTask)
  const removeTask = useStore((s) => s.removeTask)
  const storeError = useStore((s) => s.error)
  const sleepStart = useAuth((s) => s.sleepStart)
  const sleepEnd = useAuth((s) => s.sleepEnd)

  const timeColRef = useRef<HTMLDivElement>(null)
  const dayScrollRef = useRef<HTMLDivElement>(null)

  // Sync vertical scroll between time column and day columns
  useEffect(() => {
    const dayEl = dayScrollRef.current
    const timeEl = timeColRef.current
    if (!dayEl || !timeEl) return

    let syncing = false
    const onDayScroll = () => {
      if (syncing) return
      syncing = true
      timeEl.scrollTop = dayEl.scrollTop
      requestAnimationFrame(() => { syncing = false })
    }
    dayEl.addEventListener('scroll', onDayScroll)
    return () => dayEl.removeEventListener('scroll', onDayScroll)
  }, [week])

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

  const displayError = error || storeError
  const sleepStartMin = timeToMinutes(sleepStart)
  const sleepEndMin = timeToMinutes(sleepEnd)
  const sleepStartRow = minutesToRow(sleepStartMin)
  const sleepEndRow = minutesToRow(sleepEndMin)

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Error toast */}
      {displayError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg max-w-md text-center"
          onClick={() => useStore.getState().set({ error: null })}
          style={{ cursor: 'pointer' }}
        >
          ⚠️ {displayError}
        </div>
      )}

      {/* Time labels column — synced scroll */}
      <div ref={timeColRef} className="w-14 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto overflow-x-hidden">
        <div className="h-10 border-b border-gray-200 bg-gray-100" />
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
          const hour = Math.floor(i / 4)
          const min = (i % 4) * 15
          const showLabel = min === 0
          let isInSleep = false
          if (sleepStartMin > sleepEndMin) {
            isInSleep = i >= sleepStartRow || i < sleepEndRow
          } else {
            isInSleep = i >= sleepStartRow && i < sleepEndRow
          }
          return (
            <div
              key={i}
              className={`flex items-start justify-end pr-2 text-xs font-medium ${isInSleep ? 'text-indigo-300' : 'text-gray-500'}`}
              style={{ height: `${ROW_HEIGHT_REM}rem` }}
            >
              {showLabel ? `${String(hour).padStart(2, '0')}:00` : ''}
            </div>
          )
        })}
      </div>

      {/* Day columns — scrollable */}
      <div ref={dayScrollRef} className="flex-1 flex overflow-x-auto overflow-y-auto">
        {week.days.map((day) => (
          <DayColumn
            key={day.day_date}
            date={day.day_date}
            dayName={day.day_name}
            tasks={day.tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sleepStart={sleepStart}
            sleepEnd={sleepEnd}
          />
        ))}
      </div>
    </div>
  )
}

export default WeekView
