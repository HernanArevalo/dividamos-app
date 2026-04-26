'use client'

import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { formatAmount, settlementKey } from '@/lib/format'
import { getPaidKeys, savePaidKeys } from '@/lib/storage'
import type { Settlement, Participant } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface Props {
  settlements: Settlement[]
  participants: Participant[]
  sessionId: string
}

export function SettlementList({ settlements, participants, sessionId }: Props) {
  const [paidKeys, setPaidKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    setPaidKeys(getPaidKeys(sessionId))
  }, [sessionId])

  function getName(id: string) {
    return participants.find((p) => p.id === id)?.name ?? id
  }

  function toggle(key: string) {
    setPaidKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      savePaidKeys(sessionId, next)
      return next
    })
  }

  if (settlements.length === 0) {
    return (
      <div className="bg-secondary/50 rounded-2xl p-6 text-center text-muted-foreground text-sm">
        {participants.length < 2
          ? 'Agregá al menos 2 participantes para ver cómo dividir.'
          : 'No hay pagos pendientes. ¡Todos están al día!'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {settlements.map((s) => {
        const key = settlementKey(s.from, s.to, s.amount)
        const isPaid = paidKeys.has(key)
        const fromName = getName(s.from)
        const toName = getName(s.to)
        const toAlias = participants.find((p) => p.id === s.to)?.alias

        return (
          <div
            key={key}
            className={cn(
              'bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm transition-opacity',
              isPaid && 'opacity-50'
            )}
          >
            <Checkbox
              id={key}
              checked={isPaid}
              onCheckedChange={() => toggle(key)}
              aria-label="Marcar como pagado"
            />
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  'flex items-center gap-1.5 flex-wrap text-sm font-medium',
                  isPaid && 'line-through text-muted-foreground'
                )}
              >
                <span>{fromName}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{toName}</span>
                {toAlias && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({toAlias})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  'font-bold text-primary',
                  isPaid && 'line-through text-muted-foreground'
                )}
              >
                {formatAmount(s.amount)}
              </span>
              <Label
                htmlFor={key}
                className={cn(
                  'text-xs cursor-pointer select-none',
                  isPaid ? 'text-muted-foreground' : 'text-primary'
                )}
              >
                {isPaid ? 'Pagado' : 'Pagar'}
              </Label>
            </div>
          </div>
        )
      })}
    </div>
  )
}
