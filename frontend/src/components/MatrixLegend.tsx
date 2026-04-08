import React from 'react'

const quadrants = [
  { code: 'Q1', label: 'Do First', desc: 'Urgent + Important', color: 'bg-red-500' },
  { code: 'Q2', label: 'Schedule', desc: 'Important, Not Urgent', color: 'bg-blue-500' },
  { code: 'Q3', label: 'Delegate', desc: 'Urgent, Not Important', color: 'bg-amber-500' },
  { code: 'Q4', label: 'Eliminate', desc: 'Not Urgent, Not Important', color: 'bg-gray-400' },
]

const MatrixLegend: React.FC = () => (
  <div className="flex items-center gap-4 px-6 py-2 bg-gray-50 border-b border-gray-200 text-xs">
    <span className="text-gray-500 font-medium">Covey Matrix:</span>
    {quadrants.map((q) => (
      <div key={q.code} className="flex items-center gap-1.5">
        <span className={`w-3 h-3 rounded-sm ${q.color}`} />
        <span className="text-gray-700">
          {q.code}: {q.label}
        </span>
      </div>
    ))}
  </div>
)

export default MatrixLegend
