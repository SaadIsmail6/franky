const DEFAULT_MAX_CHARS = 900

export function truncate(s: string, n: number): string {
    if (s.length <= n) return s
    if (n <= 1) return '…'
    return s.slice(0, n - 1) + '…'
}

export function relTime(targetUnixSeconds: number, nowMs: number = Date.now()): string {
    const targetMs = targetUnixSeconds * 1000
    const diffMs = targetMs - nowMs

    if (diffMs <= -60_000) {
        return 'ended'
    }
    if (Math.abs(diffMs) < 60_000) {
        return 'now'
    }

    let remainingMs = Math.abs(diffMs)
    const minutes = Math.round(remainingMs / 60_000)
    if (minutes < 60) {
        return `in ${minutes}m`
    }

    const hours = Math.floor(minutes / 60)
    const leftoverMinutes = minutes % 60
    if (hours < 24) {
        return leftoverMinutes > 0 ? `in ${hours}h ${leftoverMinutes}m` : `in ${hours}h`
    }

    const days = Math.floor(hours / 24)
    const leftoverHours = hours % 24
    if (leftoverHours === 0) {
        return `in ${days}d`
    }
    return `in ${days}d ${leftoverHours}h`
}

type BulletListOptions = {
    header?: string
    maxChars?: number
    joiner?: string
}

export function bulletList(items: string[], opts: BulletListOptions = {}): string {
    const { header, maxChars = DEFAULT_MAX_CHARS, joiner } = opts
    const separator = joiner ?? '\n\n'
    const parts: string[] = []

    if (header) {
        parts.push(header)
    }

    const contentStartIndex = parts.length
    for (const item of items) {
        parts.push(item)
        const candidate = parts.join(separator) || ''
        if (candidate.length > maxChars) {
            parts.pop()
            if (parts.length > contentStartIndex) {
                parts.push('…and more')
                const shortened = parts.join(separator)
                if (shortened.length > maxChars) {
                    // Remove items until it fits
                    while (parts.length > contentStartIndex + 1 && parts.join(separator).length > maxChars) {
                        parts.splice(parts.length - 2, 1)
                    }
                }
            } else {
                // No content fit; just add indicator
                parts.push('…and more')
            }
            return parts.join(separator)
        }
    }

    if (parts.length === contentStartIndex && header) {
        // No items, but header was provided; drop header to avoid empty block
        return ''
    }

    return parts.join(separator)
}


