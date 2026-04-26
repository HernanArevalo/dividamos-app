'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Plus,
  Users,
  Receipt,
  ArrowLeftRight,
  ArrowLeft,
  SplitSquareHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/use-session'
import { AddParticipantModal } from '@/components/dividamos/add-participant-modal'
import { AddExpenseModal } from '@/components/dividamos/add-expense-modal'
import { ParticipantCard } from '@/components/dividamos/participant-card'
import { ExpenseCard } from '@/components/dividamos/expense-card'
import { SettlementList } from '@/components/dividamos/settlement-list'
import { CopyLinkButton } from '@/components/dividamos/copy-link-button'
import { WhatsAppGroupShare } from '@/components/dividamos/whatsapp-share'
import { calculateSettlements, getTotalExpenses, getSharePerPerson } from '@/lib/settlement'
import { formatAmount } from '@/lib/format'
import type { Participant, Expense } from '@/lib/types'

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const {
    session,
    loading,
    addParticipant,
    updateParticipant,
    removeParticipant,
    addExpense,
    updateExpense,
    removeExpense,
  } = useSession(sessionId)

  const [participantModalOpen, setParticipantModalOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-center">
          No se encontró este grupo. Puede que el link sea incorrecto.
        </p>
        <Button variant="outline" onClick={() => router.push('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    )
  }

  const settlements = calculateSettlements(session.participants, session.expenses)
  const total = getTotalExpenses(session.expenses)
  const share = getSharePerPerson(session.expenses, session.participants.length)

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="bg-primary rounded-xl p-2 shadow-sm">
          <SplitSquareHorizontal className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-xl text-foreground truncate text-balance">
            {session.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {session.participants.length} participantes · {session.expenses.length} gastos
          </p>
        </div>
      </header>

      {/* Stats bar */}
      {session.expenses.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-0.5">Total</p>
            <p className="font-bold text-xl text-foreground">{formatAmount(total)}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-0.5">Por persona</p>
            <p className="font-bold text-xl text-foreground">
              {session.participants.length > 0 ? formatAmount(share) : '-'}
            </p>
          </div>
        </div>
      )}

      {/* Participants section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Participantes</h2>
            <span className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
              {session.participants.length}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingParticipant(null)
              setParticipantModalOpen(true)
            }}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </Button>
        </div>

        {session.participants.length === 0 ? (
          <div className="bg-secondary/50 rounded-2xl p-6 text-center text-muted-foreground text-sm">
            Agregá participantes para empezar.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {session.participants.map((p) => (
              <ParticipantCard
                key={p.id}
                participant={p}
                participants={session.participants}
                expenses={session.expenses}
                onEdit={() => {
                  setEditingParticipant(p)
                  setParticipantModalOpen(true)
                }}
                onDelete={() => removeParticipant(p.id)}
                onClick={() => router.push(`/${sessionId}/${p.slug}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Expenses section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Gastos</h2>
            <span className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
              {session.expenses.length}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingExpense(null)
              setExpenseModalOpen(true)
            }}
            disabled={session.participants.length === 0}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </Button>
        </div>

        {session.expenses.length === 0 ? (
          <div className="bg-secondary/50 rounded-2xl p-6 text-center text-muted-foreground text-sm">
            {session.participants.length === 0
              ? 'Primero agregá participantes.'
              : 'Agregá gastos para dividir.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {session.expenses.map((e) => (
              <ExpenseCard
                key={e.id}
                expense={e}
                participants={session.participants}
                onEdit={() => {
                  setEditingExpense(e)
                  setExpenseModalOpen(true)
                }}
                onDelete={() => removeExpense(e.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Settlement section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ArrowLeftRight className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-foreground">Cómo dividimos</h2>
        </div>
        <SettlementList
          settlements={settlements}
          participants={session.participants}
          sessionId={sessionId}
        />
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pb-6">
        <WhatsAppGroupShare session={session} />
        <CopyLinkButton label="Copiar link del grupo" />
      </div>

      {/* Modals */}
      <AddParticipantModal
        open={participantModalOpen}
        onClose={() => setParticipantModalOpen(false)}
        editing={editingParticipant}
        onSave={(name, alias) => {
          if (editingParticipant) {
            updateParticipant(editingParticipant.id, name, alias)
          } else {
            addParticipant(name, alias)
          }
        }}
      />
      <AddExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        editing={editingExpense}
        participants={session.participants}
        onSave={(description, amount, paidBy) => {
          if (editingExpense) {
            updateExpense(editingExpense.id, description, amount, paidBy)
          } else {
            addExpense(description, amount, paidBy)
          }
        }}
      />
    </main>
  )
}
