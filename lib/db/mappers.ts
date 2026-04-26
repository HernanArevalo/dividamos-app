import type { Expense, Participant, Session } from '@/lib/types'

type DbSession = {
  id: string
  title: string
  currency: string
  participants: Participant[]
  expenses: Expense[]
}

export function mapDbSession(session: DbSession): Session {
  return {
    id: session.id,
    title: session.title,
    currency: session.currency,
    participants: session.participants,
    expenses: session.expenses,
  }
}
