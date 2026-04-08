import { useEffect, useCallback } from 'react'
import { useStore } from '../store/taskStore'

export const useWeek = (enabled: boolean = true) => {
  const week = useStore((s) => s.week)
  const weekOffset = useStore((s) => s.weekOffset)
  const loading = useStore((s) => s.loading)
  const error = useStore((s) => s.error)
  const fetchWeek = useStore((s) => s.fetchWeek)

  useEffect(() => {
    if (enabled) {
      fetchWeek(weekOffset)
    }
  }, [fetchWeek, weekOffset, enabled])

  return { week, loading, error, refetch: fetchWeek }
}

export const useQuote = () => {
  const quote = useStore((s) => s.quote)
  const fetchQuote = useStore((s) => s.fetchQuote)

  useEffect(() => {
    fetchQuote()
  }, [fetchQuote])

  return quote
}

export const useTasks = () => {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const removeTask = useStore((s) => s.removeTask)

  return { tasks, addTask, updateTask, removeTask }
}

export const useAICheck = () => {
  const aiMessage = useStore((s) => s.aiMessage)
  const setAIMessage = useStore((s) => s.setAIMessage)

  return { aiMessage, setAIMessage }
}
