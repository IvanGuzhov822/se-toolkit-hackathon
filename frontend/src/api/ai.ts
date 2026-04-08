import apiClient from './client'
import { AICheckResponse } from '../types'

export const checkPriorityChange = async (
  taskId: string,
  taskTitle: string,
  oldImportant: boolean,
  newImportant: boolean,
  oldDeadline: string | null,
  newDeadline: string | null,
): Promise<AICheckResponse> => {
  const { data } = await apiClient.post<AICheckResponse>('/ai/check-priority', {
    task_id: taskId,
    task_title: taskTitle,
    old_important: oldImportant,
    new_important: newImportant,
    old_deadline: oldDeadline,
    new_deadline: newDeadline,
  })
  return data
}
