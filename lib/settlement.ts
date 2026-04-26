import type { Participant, Expense, Settlement } from './types'

export function calculateSettlements(
  participants: Participant[],
  expenses: Expense[]
): Settlement[] {
  if (participants.length < 2 || expenses.length === 0) return []

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const share = total / participants.length

  const balances: Record<string, number> = {}
  for (const p of participants) {
    const paid = expenses
      .filter((e) => e.paidBy === p.id)
      .reduce((sum, e) => sum + e.amount, 0)
    balances[p.id] = paid - share
  }

  const creditors = participants
    .filter((p) => balances[p.id] > 0.001)
    .map((p) => ({ id: p.id, amount: balances[p.id] }))
    .sort((a, b) => b.amount - a.amount)

  const debtors = participants
    .filter((p) => balances[p.id] < -0.001)
    .map((p) => ({ id: p.id, amount: Math.abs(balances[p.id]) }))
    .sort((a, b) => b.amount - a.amount)

  const settlements: Settlement[] = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor = debtors[di]
    const amount = Math.min(creditor.amount, debtor.amount)

    settlements.push({
      from: debtor.id,
      to: creditor.id,
      amount: Math.round(amount * 100) / 100,
      isPaid: false,
    })

    creditor.amount -= amount
    debtor.amount -= amount

    if (creditor.amount < 0.001) ci++
    if (debtor.amount < 0.001) di++
  }

  return settlements
}

export function getParticipantBalance(
  participantId: string,
  participants: Participant[],
  expenses: Expense[]
): number {
  if (participants.length === 0) return 0
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const share = total / participants.length
  const paid = expenses
    .filter((e) => e.paidBy === participantId)
    .reduce((sum, e) => sum + e.amount, 0)
  return Math.round((paid - share) * 100) / 100
}

export function getTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

export function getSharePerPerson(
  expenses: Expense[],
  participantCount: number
): number {
  if (participantCount === 0) return 0
  return getTotalExpenses(expenses) / participantCount
}
