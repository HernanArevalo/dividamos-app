export function formatAmount(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function settlementKey(from: string, to: string, amount: number): string {
  return `${from}__${to}__${amount.toFixed(2)}`
}
