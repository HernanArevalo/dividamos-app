'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Session } from '@/lib/types'
import {
  addExpenseAction,
  addParticipantAction,
  getSessionAction,
  removeExpenseAction,
  removeParticipantAction,
  updateExpenseAction,
  updateParticipantAction,
} from '@/lib/actions/session-actions'

export function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    getSessionAction(sessionId)
      .then((data) => {
        if (!mounted) return
        setSession(data)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [sessionId])

  const addParticipant = useCallback(
    async (name: string, alias: string) => {
      const updated = await addParticipantAction(sessionId, name, alias)
      setSession(updated)
    },
    [sessionId]
  )

  const updateParticipant = useCallback(
    async (id: string, name: string, alias: string) => {
      const updated = await updateParticipantAction(sessionId, id, name, alias)
      setSession(updated)
    },
    [sessionId]
  )

  const removeParticipant = useCallback(
    async (id: string) => {
      const updated = await removeParticipantAction(sessionId, id)
      setSession(updated)
    },
    [sessionId]
  )

  const addExpense = useCallback(
    async (description: string, amount: number, paidBy: string) => {
      const updated = await addExpenseAction(sessionId, description, amount, paidBy)
      setSession(updated)
    },
    [sessionId]
  )

  const updateExpense = useCallback(
    async (id: string, description: string, amount: number, paidBy: string) => {
      const updated = await updateExpenseAction(
        sessionId,
        id,
        description,
        amount,
        paidBy
      )
      setSession(updated)
    },
    [sessionId]
  )

  const removeExpense = useCallback(
    async (id: string) => {
      const updated = await removeExpenseAction(sessionId, id)
      setSession(updated)
    },
    [sessionId]
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
