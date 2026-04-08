import apiClient from './client'

export const login = async (username: string, password: string) => {
  const { data } = await apiClient.post('/auth/login', { username, password })
  return data
}

export const register = async (
  username: string,
  password: string,
  sleepStart: string,
  sleepEnd: string,
) => {
  const { data } = await apiClient.post('/auth/register', {
    username,
    password,
    sleep_start: sleepStart,
    sleep_end: sleepEnd,
  })
  return data
}

export const getMe = async (token: string) => {
  const { data } = await apiClient.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}
