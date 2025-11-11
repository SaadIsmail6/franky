import { bulletList, relTime, truncate } from '../utils/format'

const CACHE_TTL_MS = 90_000

type CacheKind = 'general' | 'search'

export type AiringItem = {
    title: string
    episode: number
    airingAt: number
}

type CacheKey = string

type CacheEntry = {
    expiresAt: number
    data: AiringItem[]
    kind: CacheKind
}

const cache = new Map<CacheKey, CacheEntry>()

const GENERAL_QUERY = `
  query ($page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      airingSchedules(notYetAired: true, sort: TIME) {
        airingAt
        episode
        media {
          title {
            english
            romaji
            native
          }
        }
      }
    }
  }
`

const SEARCH_QUERY = `
  query ($search: String!, $page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      media(search: $search, type: ANIME) {
        title {
          english
          romaji
          native
        }
        nextAiringEpisode {
          airingAt
          episode
        }
      }
    }
  }
`

function buildCacheKey(kind: CacheKind, query: string | undefined, page: number, perPage: number): CacheKey {
    return `${kind}:${query ?? ''}:${page}:${perPage}`
}

function getFromCache(kind: CacheKind, key: CacheKey): AiringItem[] | null {
    const entry = cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
        cache.delete(key)
        return null
    }
    console.log(`[AIRING] cache hit kind=${kind}`)
    return entry.data
}

function setCache(kind: CacheKind, key: CacheKey, data: AiringItem[]): void {
    cache.set(key, {
        kind,
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
    })
}

function pickTitle(title: { english?: string | null; romaji?: string | null; native?: string | null } | null | undefined): string {
    if (!title) return 'Unknown'
    return title.english || title.romaji || title.native || 'Unknown'
}

export async function fetchUpcomingAiring(opts: { query?: string; page?: number; perPage?: number } = {}): Promise<AiringItem[]> {
    const { query, page = 1, perPage = 10 } = opts
    const kind: CacheKind = query ? 'search' : 'general'
    const cacheKey = buildCacheKey(kind, query, page, perPage)
    const cached = getFromCache(kind, cacheKey)
    if (cached) {
        return cached
    }

    const body =
        kind === 'search'
            ? {
                  query: SEARCH_QUERY,
                  variables: { search: query, page, perPage },
              }
            : {
                  query: GENERAL_QUERY,
                  variables: { page, perPage },
              }

    const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        throw new Error(`AniList API returned status ${response.status}: ${response.statusText}`)
    }

    const payload = (await response.json()) as Record<string, any>
    let items: AiringItem[] = []

    if (kind === 'search') {
        const media: any[] = payload?.data?.Page?.media ?? []
        items = media
            .map((entry) => ({
                title: pickTitle(entry?.title),
                episode: entry?.nextAiringEpisode?.episode ?? 0,
                airingAt: entry?.nextAiringEpisode?.airingAt ?? 0,
            }))
            .filter((item) => item.airingAt > 0 && item.episode > 0)
    } else {
        const schedules: any[] = payload?.data?.Page?.airingSchedules ?? []
        items = schedules
            .map((entry) => ({
                title: pickTitle(entry?.media?.title),
                episode: entry?.episode ?? 0,
                airingAt: entry?.airingAt ?? 0,
            }))
            .filter((item) => item.airingAt > 0 && item.episode > 0)
    }

    items.sort((a, b) => a.airingAt - b.airingAt)
    setCache(kind, cacheKey, items)
    return items
}

type FormatAiringListOptions = {
    limit?: number
    tz?: string
    header?: string
    groupByDay?: boolean
    maxChars?: number
}

function createFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    try {
        return new Intl.DateTimeFormat(locale, options)
    } catch {
        const { timeZone, ...rest } = options
        return new Intl.DateTimeFormat(locale, rest)
    }
}

function buildBulletLine(
    item: AiringItem,
    date: Date,
    timeFormatter: Intl.DateTimeFormat,
    nowMs: number
): string {
    const title = truncate(item.title, 40)
    const timeLabel = timeFormatter.format(date)
    const relative = relTime(item.airingAt, nowMs)
    return `• ${title} — Ep ${item.episode}\n  🕒 ${timeLabel} (${relative})`
}

export function formatAiringList(items: AiringItem[], opts: FormatAiringListOptions = {}): string {
    const { limit = 5, tz = 'UTC', header, groupByDay = false, maxChars = 900 } = opts

    if (items.length === 0) {
        return 'No upcoming episodes found.'
    }

    const selected = items.slice(0, limit)
    const nowMs = Date.now()

    const timeFormatter = createFormatter('en-US', {
        timeZone: tz,
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })

    const keyFormatter = createFormatter('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })

    const dayLabelFormatter = createFormatter('en-US', {
        timeZone: tz,
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    })

    const sections: string[] = []

    if (groupByDay) {
        const groups = new Map<
            string,
            {
                label: string
                entries: string[]
            }
        >()
        const order: string[] = []

        for (const item of selected) {
            const date = new Date(item.airingAt * 1000)
            const key = keyFormatter.format(date)
            if (!groups.has(key)) {
                groups.set(key, {
                    label: dayLabelFormatter.format(date),
                    entries: [],
                })
                order.push(key)
            }
            const group = groups.get(key)!
            group.entries.push(buildBulletLine(item, date, timeFormatter, nowMs))
        }

        for (const key of order) {
            const group = groups.get(key)!
            const lines = [`📅 ${group.label}`, ...group.entries]
            sections.push(lines.join('\n'))
        }
    } else {
        for (const item of selected) {
            const date = new Date(item.airingAt * 1000)
            sections.push(buildBulletLine(item, date, timeFormatter, nowMs))
        }
    }

    if (items.length > limit) {
        sections.push('…and more')
    }

    const message = bulletList(sections, { header, maxChars })

    if (!message.trim()) {
        return 'No upcoming episodes found.'
    }

    return message
}

