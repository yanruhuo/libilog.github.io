export type Cloud = {
  ip: string
  location: {
    id: string
    name: string
    country: string
    path: string
    timezone: string
    timezone_offset: string
  }
  now: {
    text: string
    code: string
    temperature: string
  }
  last_update: string
}

export type Label = {
  id: number
  url: string
  name: string
  description: string
  color: string
}

export type Milestone = {
  id: number
  number: number
  url: string
  title: string
  description: string
  open_issues: number
  updated_at: string
}

export type Issue = {
  id: number
  number: number
  url: string
  title: string
  body: string
  description: string
  created_at: string
  updated_at: string
  milestone: Milestone
  labels: Array<Label>
}

export type QueryParams = {
  page: number
  pageSize?: number
  state: 'open' | 'closed'
  filter?: string
}

export type IssueLabel = 'About' | 'Friend' | 'Book' | 'Project'

export type CustomIssue = {
  [key: string]: any
}

export type Hot = {
  [key: number]: number
}
