export interface Participant {
  id: string
  name: string
  alias: string
  slug: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string // participantId
}

export interface Session {
  id: string
  title: string
  currency: string
  participants: Participant[]
  expenses: Expense[]
}

export interface Settlement {
  from: string // participantId
  to: string // participantId
  amount: number
  isPaid: boolean
}
