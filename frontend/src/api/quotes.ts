import apiClient from './client'
import { Quote } from '../types'

export const getRandomQuote = async (): Promise<Quote> => {
  const { data } = await apiClient.get<Quote>('/quotes/random')
  return data
}
