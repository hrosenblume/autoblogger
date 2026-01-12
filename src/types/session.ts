// Session type - user provides their own auth session
export interface Session {
  user?: {
    id?: string
    email?: string
    name?: string
    role?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}
