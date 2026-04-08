import React from 'react'
import { Task } from '../types'
import { getQuadrantInfo } from '../utils/timeHelpers'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const info = getQuadrantInfo(task.quadrant)

  // Calculate height based on duration (30 min = 2rem = h-8)
  const heightRem = Math.max((task.duration_min / 30) * 2, 2)

  return (
    <div
      className={`absolute left-0 right-0 mx-1 rounded-md px-2 py-1 border-l-4 text-xs cursor-pointer hover:shadow-md transition-shadow ${info.color}`}
      style={{
        height: `${heightRem}rem`,
        top: '0',
        overflow: 'hidden',
      }}
      onClick={() => onEdit(task)}
      title={`${task.title} (${task.duration_min} min)`}
    >
      <div className="font-semibold text-gray-800 truncate">{task.title}</div>
      {task.duration_min >= 30 && (
        <div className="text-gray-500 text-[10px] mt-0.5">
          {task.duration_min} min
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(task.id)
        }}
        className="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete task"
      >
        ✕
      </button>
    </div>
  )
}

export default TaskCard
