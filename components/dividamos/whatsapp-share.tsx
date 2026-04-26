'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatAmount } from '@/lib/format'
import {
  calculateSettlements,
  getParticipantBalance,
  getTotalExpenses,
  getSharePerPerson,
} from '@/lib/settlement'
import type { Session, Participant } from '@/lib/types'

// ── Group WhatsApp button ────────────────────────────────────────────────────

interface GroupProps {
  session: Session
}

export function WhatsAppGroupShare({ session }: GroupProps) {
  function buildMessage() {
    const { title, participants, expenses, currency } = session
    const total = getTotalExpenses(expenses)
    const share = getSharePerPerson(expenses, participants.length)
    const settlements = calculateSettlements(participants, expenses)
    const base = window.location.origin

    const summary = participants
      .map((p) => {
        const paid = expenses
          .filter((e) => e.paidBy === p.id)
          .reduce((s, e) => s + e.amount, 0)
        const balance = getParticipantBalance(p.id, participants, expenses)
        const balanceText =
          balance > 0.001
            ? `recibe ${formatAmount(balance)}`
            : balance < -0.001
              ? `debe ${formatAmount(Math.abs(balance))}`
              : 'está al día'
        return `- ${p.name}: puso ${formatAmount(paid)} → ${balanceText}`
      })
      .join('\n')

    const paymentsText = settlements
      .map((s) => {
        const from = participants.find((p) => p.id === s.from)?.name ?? s.from
        const to = participants.find((p) => p.id === s.to)?.name ?? s.to
        return `- ${from} → ${to}: ${formatAmount(s.amount)}`
      })
      .join('\n')

    const individualLinks = participants
      .map((p) => `${p.name}: ${base}/${session.id}/${p.slug}`)
      .join('\n')

    const msg = [
      `🍖 ${title}`,
      '',
      `💰 Total: ${formatAmount(total)}`,
      `👥 Por persona: ${formatAmount(share)}`,
      '',
      '📊 Resumen:',
      summary,
      '',
      '💸 Pagos:',
      paymentsText || '¡Todos están al día!',
      '',
      '🔗 Ver detalle:',
      individualLinks,
      '',
      `🌐 Ver todo: ${base}/${session.id}`,
    ].join('\n')

    return msg
  }

  function handleClick() {
    const msg = buildMessage()
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <Button
      onClick={handleClick}
      className="bg-[#25D366] hover:bg-[#1ebe5d] text-white gap-2"
      size="sm"
    >
      <MessageCircle className="w-4 h-4" />
      Compartir grupo
    </Button>
  )
}

// ── Individual WhatsApp button ───────────────────────────────────────────────

interface IndividualProps {
  session: Session
  participant: Participant
}

export function WhatsAppIndividualShare({ session, participant }: IndividualProps) {
  function buildMessage() {
    const { title, participants, expenses } = session
    const balance = getParticipantBalance(participant.id, participants, expenses)
    const settlements = calculateSettlements(participants, expenses)
    const base = window.location.origin

    const mySettlements = settlements.filter(
      (s) => s.from === participant.id || s.to === participant.id
    )

    const paymentLines = mySettlements
      .map((s) => {
        const from = participants.find((p) => p.id === s.from)?.name ?? s.from
        const to = participants.find((p) => p.id === s.to)
        const toAlias = to?.alias ? ` (alias: ${to.alias})` : ''
        return `- ${from} → ${to?.name ?? s.to}${toAlias}: ${formatAmount(s.amount)}`
      })
      .join('\n')

    const actionText =
      balance > 0.001
        ? `cobrar ${formatAmount(balance)}`
        : balance < -0.001
          ? `pagar ${formatAmount(Math.abs(balance))}`
          : 'estás al día'

    const creditorAliases = mySettlements
      .filter((s) => s.from === participant.id)
      .map((s) => participants.find((p) => p.id === s.to))
      .filter(Boolean)
      .filter((p) => p!.alias)
      .map((p) => `${p!.name}: ${p!.alias}`)
      .join('\n')

    const msg = [
      `Hola ${participant.name} 👋`,
      '',
      `En "${title}":`,
      `👉 Tenés que ${actionText}`,
      '',
      ...(mySettlements.length > 0
        ? ['💸 Pagos:', paymentLines, '']
        : []),
      ...(creditorAliases
        ? ['💳 Alias de pago:', creditorAliases, '']
        : []),
      `🔗 Ver tu detalle: ${base}/${session.id}/${participant.slug}`,
    ].join('\n')

    return msg
  }

  function handleClick() {
    const msg = buildMessage()
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <Button
      onClick={handleClick}
      className="bg-[#25D366] hover:bg-[#1ebe5d] text-white gap-2"
      size="sm"
    >
      <MessageCircle className="w-4 h-4" />
      Enviar por WhatsApp
    </Button>
  )
}
