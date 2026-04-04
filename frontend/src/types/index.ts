export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  is_important: boolean
  deadline: string | null
  scheduled_date: string
  start_time: string
  duration_min: number
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  created_at: string  // ISO 8601 from backend
  updated_at: string  // ISO 8601 from backend
}

export interface WeekDay {
  day_date: string
  day_name: string
  tasks: Task[]
}

export interface WeekView {
  week_start: string
  week_end: string
  days: WeekDay[]
}

export interface Quote {
  text: string
  quadrant_tag: string
}

export interface AICheckResponse {
  ai_message: string
  confidence: number
}

export type TaskFormData = {
  title: string
  description: string
  is_important: boolean
  has_deadline: boolean
  deadline: string
  scheduled_date: string
  duration_min: number
}
