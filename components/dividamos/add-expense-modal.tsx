'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Expense, Participant } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (description: string, amount: number, paidBy: string) => void
  participants: Participant[]
  editing?: Expense | null
}

export function AddExpenseModal({
  open,
  onClose,
  onSave,
  participants,
  editing,
}: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setDescription(editing?.description ?? '')
      setAmount(editing ? String(editing.amount) : '')
      setPaidBy(editing?.paidBy ?? (participants[0]?.id ?? ''))
      setErrors({})
    }
  }, [open, editing, participants])

  function validate() {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = 'La descripción es requerida.'
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) errs.amount = 'Ingresá un monto válido mayor a 0.'
    if (!paidBy) errs.paidBy = 'Seleccioná quién pagó.'
    return errs
  }

  function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSave(description.trim(), parseFloat(amount), paidBy)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Editar gasto' : 'Agregar gasto'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-desc">Descripción</Label>
            <Input
              id="e-desc"
              placeholder="Ej: Asado, Uber, Supermercado..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setErrors((prev) => ({ ...prev, description: '' }))
              }}
              autoFocus
            />
            {errors.description && (
              <p className="text-destructive text-xs">{errors.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-amount">Monto ($)</Label>
            <Input
              id="e-amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setErrors((prev) => ({ ...prev, amount: '' }))
              }}
            />
            {errors.amount && (
              <p className="text-destructive text-xs">{errors.amount}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>¿Quién pagó?</Label>
            <Select
              value={paidBy}
              onValueChange={(v) => {
                setPaidBy(v)
                setErrors((prev) => ({ ...prev, paidBy: '' }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un participante" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paidBy && (
              <p className="text-destructive text-xs">{errors.paidBy}</p>
            )}
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
