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

function formatRelative(targetMs: number, nowMs: number): string {
    const diffMs = targetMs - nowMs
    if (diffMs <= -3600_000) {
        return 'started'
    }
    if (diffMs <= 0) {
        return 'now'
    }
    const totalMinutes = Math.round(diffMs / 60000)
    if (totalMinutes < 60) {
        return `in ${totalMinutes}m`
    }
    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMinutes = totalMinutes % 60
    if (totalHours < 24) {
        return remainingMinutes > 0 ? `in ${totalHours}h ${remainingMinutes}m` : `in ${totalHours}h`
    }
    const totalDays = Math.floor(totalHours / 24)
    const remainingHours = totalHours % 24
    if (remainingHours === 0) {
        return `in ${totalDays}d`
    }
    return `in ${totalDays}d ${remainingHours}h`
}

export function formatAiringList(
    items: AiringItem[],
    opts: { limit?: number; tz?: string; header?: string } = {}
): string {
    const { limit = 5, tz = 'UTC', header } = opts
    const lines: string[] = []
    if (header) {
        lines.push(header)
    }

    const formatter = (() => {
        try {
            return new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: tz,
            })
        } catch {
            return new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
            })
        }
    })()

    const nowMs = Date.now()
    const toShow = items.slice(0, limit)

    for (const item of toShow) {
        const airingDate = new Date(item.airingAt * 1000)
        const formattedDate = formatter.format(airingDate)
        const relative = formatRelative(airingDate.getTime(), nowMs)
        lines.push(`• ${item.title} — Ep ${item.episode} at ${formattedDate} (${relative})`)
    }

    if (items.length === 0) {
        lines.push('No upcoming episodes found.')
    } else if (items.length > limit) {
        lines.push('…and more')
    }

    return lines.join('\n')
}


