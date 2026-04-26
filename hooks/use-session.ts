'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Session, Participant, Expense } from '@/lib/types'
import { getSession, saveSession } from '@/lib/storage'
import { generateId } from '@/lib/format'
import { uniqueSlug } from '@/lib/slugify'

export function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession(sessionId)
    setSession(s)
    setLoading(false)
  }, [sessionId])

  const updateSession = useCallback(
    (updater: (s: Session) => Session) => {
      setSession((prev) => {
        if (!prev) return prev
        const next = updater(prev)
        saveSession(next)
        return next
      })
    },
    []
  )

  const addParticipant = useCallback(
    (name: string, alias: string) => {
      updateSession((s) => {
        const existingSlugs = s.participants.map((p) => p.slug)
        const slug = uniqueSlug(name, existingSlugs)
        const participant: Participant = {
          id: generateId(),
          name: name.trim(),
          alias: alias.trim(),
          slug,
        }
        return { ...s, participants: [...s.participants, participant] }
      })
    },
    [updateSession]
  )

  const updateParticipant = useCallback(
    (id: string, name: string, alias: string) => {
      updateSession((s) => ({
        ...s,
        participants: s.participants.map((p) => {
          if (p.id !== id) return p
          const existingSlugs = s.participants
            .filter((pp) => pp.id !== id)
            .map((pp) => pp.slug)
          const slug = uniqueSlug(name, existingSlugs)
          return { ...p, name: name.trim(), alias: alias.trim(), slug }
        }),
      }))
    },
    [updateSession]
  )

  const removeParticipant = useCallback(
    (id: string) => {
      updateSession((s) => ({
        ...s,
        participants: s.participants.filter((p) => p.id !== id),
        expenses: s.expenses.filter((e) => e.paidBy !== id),
      }))
    },
    [updateSession]
  )

  const addExpense = useCallback(
    (description: string, amount: number, paidBy: string) => {
      updateSession((s) => {
        const expense: Expense = {
          id: generateId(),
          description: description.trim(),
          amount,
          paidBy,
        }
        return { ...s, expenses: [...s.expenses, expense] }
      })
    },
    [updateSession]
  )

  const updateExpense = useCallback(
    (id: string, description: string, amount: number, paidBy: string) => {
      updateSession((s) => ({
        ...s,
        expenses: s.expenses.map((e) =>
          e.id === id
            ? { ...e, description: description.trim(), amount, paidBy }
            : e
        ),
      }))
    },
    [updateSession]
  )

  const removeExpense = useCallback(
    (id: string) => {
      updateSession((s) => ({
        ...s,
        expenses: s.expenses.filter((e) => e.id !== id),
      }))
    },
    [updateSession]
  )

  return {
    session,
    loading,
    addParticipant,
    updateParticipant,
    removeParticipant,
    addExpense,
    updateExpense,
    removeExpense,
  }
}
