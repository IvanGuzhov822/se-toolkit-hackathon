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

  // Actions
  fetchWeek: () => Promise<void>
  fetchQuote: () => Promise<void>
  addTask: (form: TaskFormData) => Promise<void>
  updateTask: (id: string, form: Partial<TaskFormData>) => Promise<void>
  removeTask: (id: string) => Promise<void>
  setShowTaskForm: (show: boolean) => void
  setEditingTask: (task: Task | null) => void
  setAIMessage: (msg: string | null) => void
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

  fetchWeek: async () => {
    set({ loading: true, error: null })
    try {
      const week = await weeksApi.getCurrentWeek()
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
    await tasksApi.createTask(form)
    set({ showTaskForm: false })
    await get().fetchWeek()
  },

  updateTask: async (id: string, form: Partial<TaskFormData>) => {
    await tasksApi.updateTask(id, form)
    set({ editingTask: null, showTaskForm: false })
    await get().fetchWeek()
  },

  removeTask: async (id: string) => {
    await tasksApi.deleteTask(id)
    await get().fetchWeek()
  },

  setShowTaskForm: (show: boolean) => set({ showTaskForm: show }),
  setEditingTask: (task: Task | null) => set({ editingTask: task, showTaskForm: task !== null }),
  setAIMessage: (msg: string | null) => set({ aiMessage: msg }),
}))
