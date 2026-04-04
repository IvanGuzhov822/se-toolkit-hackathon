import React from 'react'
import Header from './components/Header'
import QuoteBanner from './components/QuoteBanner'
import MatrixLegend from './components/MatrixLegend'
import WeekView from './components/WeekView'
import TaskForm from './components/TaskForm'
import AIPromptModal from './components/AIPromptModal'
import { useStore } from './store/taskStore'
import { useWeek } from './hooks'

const App: React.FC = () => {
  const week = useStore((s) => s.week)
  const setShowTaskForm = useStore((s) => s.setShowTaskForm)
  const { week: weekData } = useWeek()

  const weekStart = week?.week_start || weekData?.week_start || ''
  const weekEnd = week?.week_end || weekData?.week_end || ''

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
