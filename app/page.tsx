'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SplitSquareHorizontal, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateId } from '@/lib/format'
import { saveSession } from '@/lib/storage'
import type { Session } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  function handleCreate() {
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Ponele un nombre al grupo.')
      return
    }
    const session: Session = {
      id: generateId(),
      title: trimmed,
      currency: 'ARS',
      participants: [],
      expenses: [],
    }
    saveSession(session)
    router.push(`/${session.id}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 mb-10 text-center">
        <div className="bg-primary rounded-2xl p-3.5 shadow-md">
          <SplitSquareHorizontal className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
            dividamos.ar
          </h1>
          <p className="text-muted-foreground mt-1.5 text-balance leading-relaxed max-w-xs">
            Dividí los gastos en grupo y generá instrucciones de pago claras.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-sm p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-lg text-foreground">
            Crear nuevo grupo
          </h2>
          <p className="text-sm text-muted-foreground">
            ¿Cómo se llama el evento o grupo?
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="session-title">Nombre del grupo</Label>
          <Input
            id="session-title"
            placeholder="Ej: Asado del domingo, Viaje a Bariloche..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>

        <Button onClick={handleCreate} className="gap-2 w-full">
          Crear grupo
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* How it works */}
      <div className="mt-10 w-full max-w-sm">
        <p className="text-xs text-center text-muted-foreground mb-4 uppercase tracking-wider font-medium">
          Cómo funciona
        </p>
        <ol className="flex flex-col gap-3">
          {[
            { step: '1', text: 'Creá el grupo y agregá a los participantes' },
            { step: '2', text: 'Cargá los gastos indicando quién pagó' },
            { step: '3', text: 'Ves al instante quién le debe plata a quién' },
          ].map(({ step, text }) => (
            <li key={step} className="flex items-start gap-3">
              <span className="bg-secondary text-primary font-bold text-sm rounded-full w-7 h-7 flex items-center justify-center shrink-0">
                {step}
              </span>
              <span className="text-sm text-muted-foreground leading-relaxed pt-0.5">
                {text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}
