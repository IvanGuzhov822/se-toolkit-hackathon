import apiClient from './client'
import { WeekView } from '../types'

export const getCurrentWeek = async (): Promise<WeekView> => {
  const { data } = await apiClient.get<WeekView>('/weeks/current')
  return data
}

export const getWeek = async (date: string): Promise<WeekView> => {
  const { data } = await apiClient.get<WeekView>(`/weeks/${date}`)
  return data
}
