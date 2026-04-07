import { create } from 'zustand'
import { Task, WeekView, Quote, TaskFormData } from '../types'
import * as tasksApi from '../api/tasks'
import * as weeksApi from '../api/weeks'
import * as quotesApi from '../api/quotes'

interface AppState {
  week: WeekView | null
  tasks: Task[]
  quote: Quote | null
  loading: boolean
  error: string | null
  showTaskForm: boolean
  editingTask: Task | null
  aiMessage: string | null
  weekOffset: number  // 0 = current week, -1 = previous, +1 = next

  // Actions
  fetchWeek: (offset?: number) => Promise<void>
  fetchQuote: () => Promise<void>
  addTask: (form: TaskFormData) => Promise<void>
  updateTask: (id: string, form: Partial<TaskFormData>) => Promise<void>
  removeTask: (id: string) => Promise<void>
  setShowTaskForm: (show: boolean) => void
  setEditingTask: (task: Task | null) => void
  setAIMessage: (msg: string | null) => void
  setWeekOffset: (offset: number) => void
}

export const useStore = create<AppState>((set, get) => ({
  week: null,
  tasks: [],
  quote: null,
  loading: false,
  error: null,
  showTaskForm: false,
  editingTask: null,
  aiMessage: null,
  weekOffset: 0,

  fetchWeek: async (offset?: number) => {
    const newOffset = offset !== undefined ? offset : get().weekOffset
    set({ loading: true, error: null, weekOffset: newOffset })
    try {
      let week: WeekView
      if (newOffset === 0) {
        // Use server-side current week to avoid timezone mismatches
        week = await weeksApi.getCurrentWeek()
      } else {
        // For past/future weeks, calculate the Monday using UTC to be consistent
        const now = new Date()
        const utcDay = now.getUTCDay() // 0=Sun, 1=Mon, ...
        const utcDate = now.getUTCDate()
        const daysToMonday = utcDay === 0 ? -6 : 1 - utcDay
        const mondayUTC = new Date(Date.UTC(
          now.getUTCFullYear(), now.getUTCMonth(),
          utcDate + daysToMonday + newOffset * 7
        ))
        const dateStr = mondayUTC.toISOString().split('T')[0]
        week = await weeksApi.getWeek(dateStr)
      }
      const allTasks = week.days.flatMap((d) => d.tasks)
      set({ week, tasks: allTasks, loading: false })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch week'
      set({ error: msg, loading: false })
    }
  },

  fetchQuote: async () => {
    try {
      const quote = await quotesApi.getRandomQuote()
      set({ quote })
    } catch {
      // Silently fail — quote is decorative
    }
  },

  addTask: async (form: TaskFormData) => {
    const result = await tasksApi.createTask(form)
    set({ showTaskForm: false })
    // If AI returned a warning, store it for the modal
    if (result.ai_warning) {
      set({ aiMessage: result.ai_warning })
    }
    const { weekOffset } = get()
    await get().fetchWeek(weekOffset)
  },

  updateTask: async (id: string, form: Partial<TaskFormData>) => {
    await tasksApi.updateTask(id, form)
    set({ editingTask: null, showTaskForm: false })
    const { weekOffset } = get()
    await get().fetchWeek(weekOffset)
  },

  removeTask: async (id: string) => {
    await tasksApi.deleteTask(id)
    const { weekOffset } = get()
    await get().fetchWeek(weekOffset)
  },

  setShowTaskForm: (show: boolean) => {
    console.log('[store] setShowTaskForm:', show)
    set({ showTaskForm: show })
  },
  setEditingTask: (task: Task | null) => set({ editingTask: task, showTaskForm: task !== null }),
  setAIMessage: (msg: string | null) => set({ aiMessage: msg }),
  setWeekOffset: (offset: number) => {
    set({ weekOffset: offset })
    get().fetchWeek(offset)
  },
}))
