import { create } from 'zustand'

interface AuthState {
  token: string | null
  username: string | null
  sleepStart: string
  sleepEnd: string
  isAuthenticated: boolean

  setAuth: (token: string, username: string, sleepStart: string, sleepEnd: string) => void
  clearAuth: () => void
  loadFromStorage: () => void
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  username: null,
  sleepStart: '23:00',
  sleepEnd: '07:00',
  isAuthenticated: false,

  setAuth: (token, username, sleepStart, sleepEnd) => {
    localStorage.setItem('coveyweek_token', token)
    localStorage.setItem('coveyweek_user', JSON.stringify({ username, sleepStart, sleepEnd }))
    set({ token, username, sleepStart, sleepEnd, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('coveyweek_token')
    localStorage.removeItem('coveyweek_user')
    set({ token: null, username: null, sleepStart: '23:00', sleepEnd: '07:00', isAuthenticated: false })
    window.location.reload()
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('coveyweek_token')
    const userStr = localStorage.getItem('coveyweek_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({
          token,
          username: user.username,
          sleepStart: user.sleepStart || '23:00',
          sleepEnd: user.sleepEnd || '07:00',
          isAuthenticated: true,
        })
      } catch {
        set({ token: null, username: null, isAuthenticated: false })
      }
    }
  },
}))
