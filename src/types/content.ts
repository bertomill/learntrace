export type ContentType = 'video' | 'article' | 'paper' | 'book' | 'podcast'

export interface Content {
  id: string
  type: ContentType
  title: string
  url: string
  date_added: string
  notes: string
  excerpt: string
  tags?: string[]
  week_id?: string
  created_at?: string
}

export interface Week {
  id: string
  week_of: string
  contents: Content[]
  summary?: string
  created_at?: string
} 