'use client'

import { Pencil, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatAmount } from '@/lib/format'
import type { Participant, Expense } from '@/lib/types'
import { getParticipantBalance } from '@/lib/settlement'
import { cn } from '@/lib/utils'

interface Props {
  participant: Participant
  participants: Participant[]
  expenses: Expense[]
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}

export function ParticipantCard({
  participant,
  participants,
  expenses,
  onEdit,
  onDelete,
  onClick,
}: Props) {
  const balance = getParticipantBalance(participant.id, participants, expenses)
  const paid = expenses
    .filter((e) => e.paidBy === participant.id)
    .reduce((s, e) => s + e.amount, 0)

  const balanceLabel =
    balance > 0.001
      ? `recibe ${formatAmount(balance)}`
      : balance < -0.001
        ? `debe ${formatAmount(Math.abs(balance))}`
        : 'está al día'

  const balanceClass =
    balance > 0.001
      ? 'text-emerald-600'
      : balance < -0.001
        ? 'text-rose-500'
        : 'text-muted-foreground'

  return (
    <div
      className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Ver detalle de ${participant.name}`}
    >
      <div className="bg-secondary rounded-full p-2.5 shrink-0">
        <User className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{participant.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          Puso {formatAmount(paid)}
          {participant.alias ? ` · ${participant.alias}` : ''}
        </p>
        <p className={cn('text-xs font-medium mt-0.5', balanceClass)}>
          {balanceLabel}
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          aria-label="Editar participante"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label="Eliminar participante"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
