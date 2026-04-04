import apiClient from './client'
import { Task, TaskFormData } from '../types'

export const getTasks = async (): Promise<Task[]> => {
  const { data } = await apiClient.get<Task[]>('/tasks')
  return data
}

export const createTask = async (form: TaskFormData): Promise<Task> => {
  const payload = {
    title: form.title,
    description: form.description || undefined,
    is_important: form.is_important,
    deadline: form.has_deadline ? form.deadline : null,
    scheduled_date: form.scheduled_date,
    duration_min: form.duration_min,
  }
  const { data } = await apiClient.post<Task>('/tasks', payload)
  return data
}

export const updateTask = async (id: string, form: Partial<TaskFormData>): Promise<Task> => {
  const payload: Record<string, unknown> = {}
  if (form.title !== undefined) payload.title = form.title
  if (form.description !== undefined) payload.description = form.description
  if (form.is_important !== undefined) payload.is_important = form.is_important
  if (form.has_deadline !== undefined) payload.deadline = form.has_deadline ? form.deadline : null
  if (form.scheduled_date) payload.scheduled_date = form.scheduled_date
  if (form.duration_min) payload.duration_min = form.duration_min

  const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload)
  return data
}

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`)
}
