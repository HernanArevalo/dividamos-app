'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Receipt,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSessionAction } from '@/lib/actions/session-actions'
import {
  calculateSettlements,
  getParticipantBalance,
  getTotalExpenses,
  getSharePerPerson,
} from '@/lib/settlement'
import { formatAmount } from '@/lib/format'
import { CopyLinkButton } from '@/components/dividamos/copy-link-button'
import { WhatsAppIndividualShare } from '@/components/dividamos/whatsapp-share'
import type { Session, Participant } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function ParticipantPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const participantSlug = params.participantSlug as string

  const [session, setSession] = useState<Session | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    getSessionAction(sessionId)
      .then((s) => {
        if (!mounted || !s) return
        const p = s.participants.find((participant) => participant.slug === participantSlug) ?? null
        setSession(s)
        setParticipant(p)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [sessionId, participantSlug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!session || !participant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-center">
          No se encontró este participante.
        </p>
        <Button variant="outline" onClick={() => router.push(`/${sessionId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al grupo
        </Button>
      </div>
    )
  }

  const balance = getParticipantBalance(
    participant.id,
    session.participants,
    session.expenses
  )
  const total = getTotalExpenses(session.expenses)
  const share = getSharePerPerson(session.expenses, session.participants.length)
  const paid = session.expenses
    .filter((e) => e.paidBy === participant.id)
    .reduce((s, e) => s + e.amount, 0)

  const settlements = calculateSettlements(session.participants, session.expenses)
  const mySettlements = settlements.filter(
    (s) => s.from === participant.id || s.to === participant.id
  )

  const myExpenses = session.expenses.filter((e) => e.paidBy === participant.id)

  const isCreditor = balance > 0.001
  const isDebtor = balance < -0.001

  const balanceBg = isCreditor
    ? 'bg-emerald-50 border-emerald-200'
    : isDebtor
      ? 'bg-rose-50 border-rose-200'
      : 'bg-secondary border-border'

  const balanceText = isCreditor
    ? 'text-emerald-600'
    : isDebtor
      ? 'text-rose-500'
      : 'text-muted-foreground'

  const balanceLabel = isCreditor
    ? `Recibe ${formatAmount(balance)}`
    : isDebtor
      ? `Debe ${formatAmount(Math.abs(balance))}`
      : 'Está al día'

  const BalanceIcon = isCreditor ? TrendingUp : isDebtor ? TrendingDown : Minus

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/${sessionId}`)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver al grupo"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="bg-primary rounded-full p-2.5 shadow-sm">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-xl text-foreground truncate">
            {participant.name}
          </h1>
          <p className="text-xs text-muted-foreground truncate">{session.title}</p>
        </div>
      </header>

      {/* Balance card */}
      <div className={cn('rounded-2xl border p-5 flex items-center gap-4', balanceBg)}>
        <div className="bg-white rounded-full p-3 shadow-sm">
          <BalanceIcon className={cn('w-5 h-5', balanceText)} />
        </div>
        <div>
          <p className={cn('text-2xl font-bold', balanceText)}>{balanceLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Puso {formatAmount(paid)} · parte: {formatAmount(share)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-0.5">Total del grupo</p>
          <p className="font-bold text-lg text-foreground">{formatAmount(total)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-0.5">Puso</p>
          <p className="font-bold text-lg text-foreground">{formatAmount(paid)}</p>
        </div>
      </div>

      {/* My settlements */}
      {mySettlements.length > 0 && (
        <section>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            Pagos que me involucran
          </h2>
          <div className="flex flex-col gap-2">
            {mySettlements.map((s) => {
              const fromP = session.participants.find((p) => p.id === s.from)
              const toP = session.participants.find((p) => p.id === s.to)
              const isMe =
                s.from === participant.id ? 'pago' : 'cobro'

              return (
                <div
                  key={`${s.from}-${s.to}`}
                  className="bg-card rounded-2xl border border-border p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          isMe === 'pago'
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-emerald-100 text-emerald-600'
                        )}
                      >
                        {isMe === 'pago' ? 'Pagás' : 'Cobrás'}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm font-medium flex-wrap">
                        <span>{fromP?.name ?? s.from}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{toP?.name ?? s.to}</span>
                      </div>
                    </div>
                    <span className="font-bold text-primary shrink-0">
                      {formatAmount(s.amount)}
                    </span>
                  </div>
                  {toP?.alias && isMe === 'pago' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Alias: <span className="font-medium">{toP.alias}</span>
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* My expenses */}
      {myExpenses.length > 0 && (
        <section>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            Gastos que pagué
          </h2>
          <div className="flex flex-col gap-2">
            {myExpenses.map((e) => (
              <div
                key={e.id}
                className="bg-card rounded-2xl border border-border p-4 shadow-sm flex items-center justify-between gap-2"
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {e.description}
                </p>
                <span className="font-bold text-sm text-foreground shrink-0">
                  {formatAmount(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pb-6">
        <WhatsAppIndividualShare session={session} participant={participant} />
        <CopyLinkButton label="Copiar mi link" />
      </div>
    </main>
  )
}
