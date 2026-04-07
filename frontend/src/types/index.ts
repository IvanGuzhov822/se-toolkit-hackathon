export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  is_important: boolean
  deadline: string | null
  deadline_time: string | null
  scheduled_date: string
  start_time: string
  duration_min: number
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  ai_warning: string | null
  created_at: string
  updated_at: string
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
  deadline_time: string
  scheduled_date: string
  start_time: string
  duration_min: number
  manual: boolean
  manual_start: string
}
