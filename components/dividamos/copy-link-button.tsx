'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  url?: string
  label?: string
  className?: string
}

export function CopyLinkButton({ url, label = 'Copiar link', className }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const target = url ?? window.location.href
    try {
      await navigator.clipboard.writeText(target)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <Button variant="outline" size="sm" className={className} onClick={handleCopy}>
      {copied ? (
        <Check className="w-4 h-4 mr-1.5 text-primary" />
      ) : (
        <Link2 className="w-4 h-4 mr-1.5" />
      )}
      {copied ? '¡Copiado!' : label}
    </Button>
  )
}
