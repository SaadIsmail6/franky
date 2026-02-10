/**
 * Lightweight per-channel rate limits for quiz, poll, and recommendation loop prevention.
 */

const lastByKey = new Map<string, number>()

function key(channelId: string, type: string): string {
  return `${channelId}:${type}`
}

const WINDOWS_MS: Record<string, number> = {
  quiz: 30_000,
  poll: 60_000,
  recommend: 15_000,
}

export function checkRateLimit(channelId: string, type: string): boolean {
  const k = key(channelId, type)
  const last = lastByKey.get(k)
  const windowMs = WINDOWS_MS[type] ?? 60_000
  if (last != null && Date.now() - last < windowMs) return true
  return false
}

export function recordRateLimit(channelId: string, type: string): void {
  lastByKey.set(key(channelId, type), Date.now())
}
