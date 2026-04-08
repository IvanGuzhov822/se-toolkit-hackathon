import apiClient from './client'
import { Task, TaskFormData } from '../types'

export const getTasks = async (): Promise<Task[]> => {
  const { data } = await apiClient.get<Task[]>('/tasks')
  return data
}

export const createTask = async (form: TaskFormData): Promise<Task> => {
  const payload: Record<string, unknown> = {
    title: form.title,
    description: form.description || undefined,
    quadrant: form.quadrant,
    deadline: (form.has_deadline && form.deadline) ? form.deadline : null,
    deadline_time: (form.has_deadline && form.deadline_time) ? form.deadline_time : null,
    scheduled_date: form.scheduled_date,
    duration_min: form.duration_min,
    manual: form.manual,
  }
  if (form.manual && form.manual_start) {
    payload.manual_start = form.manual_start
  }
  const { data } = await apiClient.post<Task>('/tasks', payload)
  return data
}

export const updateTask = async (id: string, form: Partial<TaskFormData>): Promise<Task> => {
  const payload: Record<string, unknown> = {}
  if (form.title !== undefined && form.title.trim()) payload.title = form.title.trim()
  if (form.description !== undefined) payload.description = form.description.trim() || null
  if (form.quadrant !== undefined) payload.quadrant = form.quadrant
  if (form.has_deadline !== undefined) {
    payload.deadline = form.has_deadline && form.deadline ? form.deadline : null
    payload.deadline_time = form.has_deadline && form.deadline_time ? form.deadline_time : null
  }
  if (form.scheduled_date) payload.scheduled_date = form.scheduled_date
  if (form.start_time && form.start_time.trim()) payload.start_time = form.start_time.trim()
  if (form.duration_min) payload.duration_min = form.duration_min

  const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload)
  return data
}

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`)
}
