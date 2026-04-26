'use server'

import { prisma } from '@/lib/prisma'
import { mapDbSession } from '@/lib/db/mappers'
import { generateId } from '@/lib/format'
import { uniqueSlug } from '@/lib/slugify'
import type { Session } from '@/lib/types'

const sessionInclude = {
  participants: { orderBy: { createdAt: 'asc' as const } },
  expenses: { orderBy: { createdAt: 'asc' as const } },
}

async function loadSessionOrThrow(sessionId: string): Promise<Session> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: sessionInclude,
  })

  if (!session) {
    throw new Error('No se encontró la sesión solicitada.')
  }

  return mapDbSession(session)
}

export async function createSessionAction(title: string, currency = 'ARS'): Promise<Session> {
  const session = await prisma.session.create({
    data: {
      id: generateId(),
      title: title.trim(),
      currency,
    },
    include: sessionInclude,
  })

  return mapDbSession(session)
}

export async function getSessionAction(sessionId: string): Promise<Session | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: sessionInclude,
  })

  return session ? mapDbSession(session) : null
}

export async function addParticipantAction(sessionId: string, name: string, alias: string): Promise<Session> {
  const trimmedName = name.trim()
  const trimmedAlias = alias.trim()

  const existing = await prisma.participant.findMany({
    where: { sessionId },
    select: { slug: true },
  })
  const slug = uniqueSlug(trimmedName, existing.map((p) => p.slug))

  await prisma.participant.create({
    data: {
      id: generateId(),
      sessionId,
      name: trimmedName,
      alias: trimmedAlias,
      slug,
    },
  })

  return loadSessionOrThrow(sessionId)
}

export async function updateParticipantAction(
  sessionId: string,
  participantId: string,
  name: string,
  alias: string
): Promise<Session> {
  const trimmedName = name.trim()
  const trimmedAlias = alias.trim()

  const existing = await prisma.participant.findMany({
    where: {
      sessionId,
      id: { not: participantId },
    },
    select: { slug: true },
  })
  const slug = uniqueSlug(trimmedName, existing.map((p) => p.slug))

  await prisma.participant.update({
    where: { id: participantId },
    data: {
      name: trimmedName,
      alias: trimmedAlias,
      slug,
    },
  })

  return loadSessionOrThrow(sessionId)
}

export async function removeParticipantAction(sessionId: string, participantId: string): Promise<Session> {
  await prisma.$transaction([
    prisma.expense.deleteMany({ where: { sessionId, paidBy: participantId } }),
    prisma.participant.delete({ where: { id: participantId } }),
  ])

  return loadSessionOrThrow(sessionId)
}

export async function addExpenseAction(
  sessionId: string,
  description: string,
  amount: number,
  paidBy: string
): Promise<Session> {
  await prisma.expense.create({
    data: {
      id: generateId(),
      sessionId,
      description: description.trim(),
      amount,
      paidBy,
    },
  })

  return loadSessionOrThrow(sessionId)
}

export async function updateExpenseAction(
  sessionId: string,
  expenseId: string,
  description: string,
  amount: number,
  paidBy: string
): Promise<Session> {
  await prisma.expense.update({
    where: { id: expenseId },
    data: {
      description: description.trim(),
      amount,
      paidBy,
    },
  })

  return loadSessionOrThrow(sessionId)
}

export async function removeExpenseAction(sessionId: string, expenseId: string): Promise<Session> {
  await prisma.expense.delete({ where: { id: expenseId } })

  return loadSessionOrThrow(sessionId)
}

export async function getPaidKeysAction(sessionId: string): Promise<string[]> {
  const states = await prisma.settlementState.findMany({
    where: { sessionId, isPaid: true },
    select: { key: true },
  })

  return states.map((state) => state.key)
}

export async function setSettlementPaidAction(
  sessionId: string,
  key: string,
  isPaid: boolean
): Promise<string[]> {
  if (isPaid) {
    await prisma.settlementState.upsert({
      where: { sessionId_key: { sessionId, key } },
      update: { isPaid: true },
      create: { sessionId, key, isPaid: true },
    })
  } else {
    await prisma.settlementState.deleteMany({
      where: { sessionId, key },
    })
  }

  return getPaidKeysAction(sessionId)
}
