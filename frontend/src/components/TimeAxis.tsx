import React from 'react'
import { getTimeSlots } from '../utils/timeHelpers'

const TimeAxis: React.FC = () => {
  const slots = getTimeSlots()

  return (
    <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-gray-50">
      {slots.map((time, i) => (
        <div
          key={time}
          className="h-8 flex items-start justify-end pr-2 text-[10px] text-gray-400"
          style={{ borderBottom: '1px solid #f3f4f6' }}
        >
          {time}
        </div>
      ))}
    </div>
  )
}

export default TimeAxis
