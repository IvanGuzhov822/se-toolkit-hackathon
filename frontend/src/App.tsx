import React, { useEffect } from 'react'
import { useAuth } from './store/authStore'
import AuthPage from './components/AuthPage'
import Header from './components/Header'
import QuoteBanner from './components/QuoteBanner'
import MatrixLegend from './components/MatrixLegend'
import WeekView from './components/WeekView'
import TaskForm from './components/TaskForm'
import AIPromptModal from './components/AIPromptModal'
import { useStore } from './store/taskStore'
import { useWeek } from './hooks'

const App: React.FC = () => {
  const { isAuthenticated, loadFromStorage } = useAuth()
  const { week } = useWeek()
  const setShowTaskForm = useStore((s) => s.setShowTaskForm)

  useEffect(() => {
    loadFromStorage()
  }, [])

  if (!isAuthenticated) {
    return <AuthPage />
  }

  const weekStart = week?.week_start || ''
  const weekEnd = week?.week_end || ''

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header
        weekStart={weekStart}
        weekEnd={weekEnd}
        onAddTask={() => setShowTaskForm(true)}
      />
      <QuoteBanner />
      <MatrixLegend />
      <WeekView />
      <TaskForm />
      <AIPromptModal />
    </div>
  )
}

export default App
