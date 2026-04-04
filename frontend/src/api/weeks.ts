import apiClient from './client'
import { WeekView } from '../types'

export const getCurrentWeek = async (): Promise<WeekView> => {
  const { data } = await apiClient.get<WeekView>('/weeks/current')
  return data
}
