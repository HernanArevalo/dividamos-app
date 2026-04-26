'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Participant } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (name: string, alias: string) => void
  editing?: Participant | null
}

export function AddParticipantModal({ open, onClose, onSave, editing }: Props) {
  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setAlias(editing?.alias ?? '')
      setError('')
    }
  }, [open, editing])

  function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('El nombre es requerido.')
      return
    }
    onSave(trimmedName, alias.trim())
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Editar participante' : 'Agregar participante'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-name">Nombre</Label>
            <Input
              id="p-name"
              placeholder="Ej: Juan"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-alias">
              Alias de pago{' '}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="p-alias"
              placeholder="Ej: juan.mercadopago"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editing ? 'Guardar cambios' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
