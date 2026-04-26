'use client'

import { Pencil, Trash2, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatAmount } from '@/lib/format'
import type { Expense, Participant } from '@/lib/types'

interface Props {
  expense: Expense
  participants: Participant[]
  onEdit: () => void
  onDelete: () => void
}

export function ExpenseCard({ expense, participants, onEdit, onDelete }: Props) {
  const payer = participants.find((p) => p.id === expense.paidBy)

  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
      <div className="bg-secondary rounded-full p-2.5 shrink-0">
        <Receipt className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{expense.description}</p>
        <p className="text-xs text-muted-foreground">
          Pagó {payer?.name ?? 'Desconocido'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-bold text-foreground text-sm">
          {formatAmount(expense.amount)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onEdit}
          aria-label="Editar gasto"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label="Eliminar gasto"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
