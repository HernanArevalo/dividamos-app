import type { Session } from './types'

const SESSIONS_KEY = 'dividamos_sessions'
const PAID_PREFIX = 'dividamos_paid_'

// ── Session helpers ──────────────────────────────────────────────────────────

export function getSessions(): Record<string, Session> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(SESSIONS_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getSession(id: string): Session | null {
  return getSessions()[id] ?? null
}

export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return
  const sessions = getSessions()
  sessions[session.id] = session
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

// ── Paid-settlement helpers ──────────────────────────────────────────────────

export function getPaidKeys(sessionId: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const data = localStorage.getItem(`${PAID_PREFIX}${sessionId}`)
    return data ? new Set(JSON.parse(data)) : new Set()
  } catch {
    return new Set()
  }
}

export function savePaidKeys(sessionId: string, keys: Set<string>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${PAID_PREFIX}${sessionId}`, JSON.stringify([...keys]))
}
