import React, { useState, useEffect } from 'react'
import { useStore } from '../store/taskStore'
import { TaskFormData } from '../types'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Quadrant info for display
const QUADRANT_INFO = [
  { code: 'Q1', label: 'Do First', time: '08:00 — morning', color: 'text-red-600' },
  { code: 'Q2', label: 'Schedule', time: '10:00 — deep work', color: 'text-blue-600' },
  { code: 'Q3', label: 'Delegate', time: '15:00 — after lunch', color: 'text-amber-600' },
  { code: 'Q4', label: 'Eliminate', time: '18:00 — evening', color: 'text-gray-500' },
]

const TaskForm: React.FC = () => {
  const showTaskForm = useStore((s) => s.showTaskForm)
  const editingTask = useStore((s) => s.editingTask)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const setShowTaskForm = useStore((s) => s.setShowTaskForm)
  const setEditingTask = useStore((s) => s.setEditingTask)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isImportant, setIsImportant] = useState(false)
  const [hasDeadline, setHasDeadline] = useState(false)
  const [deadline, setDeadline] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [durationMin, setDurationMin] = useState(30)

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || '')
      setIsImportant(editingTask.is_important)
      setHasDeadline(!!editingTask.deadline)
      setDeadline(editingTask.deadline || '')
      setScheduledDate(editingTask.scheduled_date)
      setDurationMin(editingTask.duration_min)
    }
  }, [editingTask])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setIsImportant(false)
    setHasDeadline(false)
    setDeadline('')
    setScheduledDate('')
    setDurationMin(30)
    setEditingTask(null)
  }

  const handleClose = () => {
    setShowTaskForm(false)
    setEditingTask(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !scheduledDate) return

    const form: TaskFormData = {
      title: title.trim(),
      description: description.trim(),
      is_important: isImportant,
      has_deadline: hasDeadline,
      deadline: hasDeadline ? deadline : '',
      scheduled_date: scheduledDate,
      duration_min: durationMin,
    }

    if (editingTask) {
      await updateTask(editingTask.id, form)
    } else {
      await addTask(form)
    }
    resetForm()
  }

  if (!showTaskForm) return null

  // Get next 4 weeks for date picker
  const today = new Date()
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 28)
  const minDate = new Date(today)
  minDate.setDate(minDate.getDate() - 7)

  console.log('TaskForm rendering, showTaskForm:', showTaskForm)

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

          {/* Important toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Important</label>
            <button
              type="button"
              onClick={() => setIsImportant(!isImportant)}
              className={`w-10 h-6 rounded-full transition-colors ${isImportant ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isImportant ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
            <span className="text-xs text-gray-500">
              {isImportant ? 'Q2 — Schedule' : 'Q4 — Eliminate'}
              {hasDeadline && (isImportant ? ' → Q1 — Do First' : ' → Q3 — Delegate')}
            </span>
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

          {/* Scheduled date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule for *</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={minDate.toISOString().split('T')[0]}
              max={maxDate.toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

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

          {/* Auto-schedule info */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
            <p className="font-medium text-gray-600">⏰ Auto-scheduled by priority:</p>
            {QUADRANT_INFO.map((q) => (
              <div key={q.code} className="flex items-center gap-2">
                <span className={`font-semibold ${q.color}`}>{q.code}:</span>
                <span className="text-gray-500">{q.time}</span>
              </div>
            ))}
          </div>

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
