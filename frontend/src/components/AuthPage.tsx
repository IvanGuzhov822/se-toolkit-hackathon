import React, { useState } from 'react'
import { useAuth } from '../store/authStore'
import * as authApi from '../api/auth'

const AuthPage: React.FC = () => {
  const { setAuth } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [sleepStart, setSleepStart] = useState('23:00')
  const [sleepEnd, setSleepEnd] = useState('07:00')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let response
      if (isLogin) {
        response = await authApi.login(username, password)
      } else {
        response = await authApi.register(username, password, sleepStart, sleepEnd)
      }
      setAuth(response.access_token, response.username, response.sleep_start, response.sleep_end)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : 'Something went wrong'
      setError(msg || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">CoveyWeek</h1>
          <p className="text-purple-200 text-sm">
            Schedule your week by principles, not by urgency.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                isLogin ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                !isLogin ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder="your_username"
                required
                minLength={3}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={4}
              />
            </div>

            {/* Sleep Schedule (registration only) */}
            {!isLogin && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <p className="text-sm font-medium text-white/80">Sleep Schedule</p>
                <p className="text-xs text-white/50">Tasks won't be scheduled during your sleep hours.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Sleep at</label>
                    <input
                      type="time"
                      value={sleepStart}
                      onChange={(e) => setSleepStart(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Wake at</label>
                    <input
                      type="time"
                      value={sleepEnd}
                      onChange={(e) => setSleepEnd(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Inspired by Stephen Covey's "7 Habits of Highly Effective People"
        </p>
      </div>
    </div>
  )
}

export default AuthPage
