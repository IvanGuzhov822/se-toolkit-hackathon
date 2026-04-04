import React from 'react'
import { useAICheck } from '../hooks'

const AIPromptModal: React.FC = () => {
  const { aiMessage, setAIMessage } = useAICheck()

  if (!aiMessage) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🤔</span>
          <h3 className="text-base font-semibold text-gray-900">Are you sure?</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">{aiMessage}</p>
        <button
          onClick={() => setAIMessage(null)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}

export default AIPromptModal
