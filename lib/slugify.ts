export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function uniqueSlug(name: string, existingSlugs: string[]): string {
  const base = toSlug(name)
  if (!existingSlugs.includes(base)) return base
  let i = 2
  while (existingSlugs.includes(`${base}-${i}`)) i++
  return `${base}-${i}`
}
