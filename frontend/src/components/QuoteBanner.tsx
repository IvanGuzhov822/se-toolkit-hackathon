import React from 'react'
import { useQuote } from '../hooks'

const QuoteBanner: React.FC = () => {
  const quote = useQuote()

  if (!quote) return null

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 px-6 py-3">
      <p className="text-center text-sm italic text-indigo-800">
        "{quote.text}"
      </p>
      <p className="text-center text-xs text-indigo-500 mt-1">— Stephen R. Covey</p>
    </div>
  )
}

export default QuoteBanner
