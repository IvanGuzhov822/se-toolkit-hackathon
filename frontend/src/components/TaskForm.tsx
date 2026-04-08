import React, { useState, useEffect } from 'react'
import { useStore } from '../store/taskStore'
import { TaskFormData } from '../types'

const QUADRANT_COLORS: Record<string, string> = {
  Q1: 'bg-red-100 border-red-500 text-red-800',
  Q2: 'bg-blue-100 border-blue-500 text-blue-800',
  Q3: 'bg-amber-100 border-amber-500 text-amber-800',
  Q4: 'bg-gray-100 border-gray-400 text-gray-700',
}

const QUADRANT_LABELS: Record<string, string> = {
  Q1: 'Do First',
  Q2: 'Schedule',
  Q3: 'Delegate',
  Q4: 'Eliminate',
}

const TaskForm: React.FC = () => {
  const showTaskForm = useStore((s) => s.showTaskForm)
  const editingTask = useStore((s) => s.editingTask)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const setShowTaskForm = useStore((s) => s.setShowTaskForm)
  const setEditingTask = useStore((s) => s.setEditingTask)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quadrant, setQuadrant] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1')
  const [hasDeadline, setHasDeadline] = useState(false)
  const [deadline, setDeadline] = useState('')
  const [deadlineTime, setDeadlineTime] = useState('23:59')
  const [scheduledDate, setScheduledDate] = useState('')
  const [durationMin, setDurationMin] = useState(30)
  const [startTime, setStartTime] = useState('09:00')
  const [startTimeChanged, setStartTimeChanged] = useState(false)
  const [manual, setManual] = useState(false)
  const [manualStart, setManualStart] = useState('09:00')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || '')
      setQuadrant(editingTask.quadrant)
      setHasDeadline(!!editingTask.deadline)
      setDeadline(editingTask.deadline || '')
      setDeadlineTime(editingTask.deadline_time ? editingTask.deadline_time.slice(0, 5) : '23:59')
      setScheduledDate(editingTask.scheduled_date)
      setStartTime(editingTask.start_time ? editingTask.start_time.slice(0, 5) : '09:00')
      setStartTimeChanged(false)
      setDurationMin(editingTask.duration_min)
      setManual(false)
    }
  }, [editingTask])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setQuadrant('Q1')
    setHasDeadline(false)
    setDeadline('')
    setDeadlineTime('23:59')
    setScheduledDate('')
    setStartTime('09:00')
    setStartTimeChanged(false)
    setDurationMin(30)
    setManual(false)
    setManualStart('09:00')
    setError('')
    setEditingTask(null)
  }

  const handleClose = () => {
    setShowTaskForm(false)
    setEditingTask(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim() || !scheduledDate) return

    const selectedDate = new Date(scheduledDate + 'T00:00:00')
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    if (selectedDate < todayStart) {
      setError('Cannot schedule a task in the past.')
      return
    }

    const form: TaskFormData = {
      title: title.trim(),
      description: description.trim(),
      quadrant,
      has_deadline: hasDeadline,
      deadline: hasDeadline ? deadline : '',
      deadline_time: hasDeadline ? deadlineTime : '',
      scheduled_date: scheduledDate,
      start_time: editingTask && startTimeChanged ? startTime : (editingTask ? '' : ''),
      duration_min: durationMin,
      manual: manual,
      manual_start: manual ? manualStart : '',
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, form)
      } else {
        await addTask(form)
      }
      resetForm()
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Something went wrong. Please try again.'
      setError(msg || 'An unexpected error occurred.')
    }
  }

  if (!showTaskForm) return null

  const today = new Date()
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 28)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '100%', maxWidth: '28rem', marginLeft: '1rem', marginRight: '1rem', padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Optional details..."
            />
          </div>

          {/* Quadrant selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuadrant(q)}
                  className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    quadrant === q
                      ? `${QUADRANT_COLORS[q]} ring-2 ring-offset-1 ring-current`
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold">{q}</div>
                  <div className="text-xs">{QUADRANT_LABELS[q]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule for *</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={today.toISOString().split('T')[0]}
              max={maxDate.toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Start time (only when editing existing task) */}
          {editingTask && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setStartTimeChanged(true) }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Change the task's start time.
              </p>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
            <select
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
              <option value={240}>4 hours</option>
            </select>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Has deadline</label>
            <button
              type="button"
              onClick={() => setHasDeadline(!hasDeadline)}
              className={`w-10 h-6 rounded-full transition-colors ${hasDeadline ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${hasDeadline ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>

          {hasDeadline && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline date</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={today.toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {hasDeadline && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline time</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {editingTask ? 'Save Changes' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm
