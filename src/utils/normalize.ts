export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function formatMillesime(m: string | number | null | undefined): string {
  if (!m && m !== 0) return ''
  const n = parseInt(String(m))
  return isNaN(n) ? '' : String(n)
}

export function formatPrix(prix: number): string {
  return `${prix} $`
}
