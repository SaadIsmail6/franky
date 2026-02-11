/**
 * Anime data layer — AniList GraphQL. Cached in memory.
 */

const ANILIST = 'https://graphql.anilist.co'
const CACHE_TTL_MS = 120_000
const cache = new Map<string, { data: unknown; expires: number }>()

function cacheKey(prefix: string, key: string): string {
  return `${prefix}:${key}`
}

function getCached<T>(key: string): T | null {
  const ent = cache.get(key)
  if (!ent || Date.now() > ent.expires) return null
  return ent.data as T
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS })
}

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ANILIST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`AniList ${res.status}`)
  const json = (await res.json()) as { data?: T; errors?: unknown[] }
  if (json.errors?.length) throw new Error('AniList error')
  return json.data as T
}

export interface AnimeItem {
  id: string
  title: string
  coverImageUrl: string
  bannerImageUrl?: string
  synopsis: string
  genres: string[]
  year?: number
  episodes?: number
  rating?: number
  externalUrl: string
}

function mapMedia(m: {
  id: number
  title?: { english?: string; romaji?: string }
  coverImage?: { large?: string }
  bannerImage?: string
  description?: string
  genres?: string[]
  seasonYear?: number
  episodes?: number
  averageScore?: number
  siteUrl?: string
}): AnimeItem {
  const title = m.title?.english || m.title?.romaji || 'Unknown'
  const cover = m.coverImage?.large || ''
  return {
    id: String(m.id),
    title,
    coverImageUrl: cover || 'https://via.placeholder.com/300x420/1a0a2e/7b2cbf?text=Anime',
    bannerImageUrl: m.bannerImage || undefined,
    synopsis: (m.description || '').replace(/<[^>]*>/g, '').slice(0, 200),
    genres: m.genres || [],
    year: m.seasonYear ?? undefined,
    episodes: m.episodes ?? undefined,
    rating: m.averageScore ?? undefined,
    externalUrl: m.siteUrl || `https://anilist.co/anime/${m.id}`,
  }
}

const SEARCH = `
  query ($search: String, $perPage: Int) {
    Page(perPage: $perPage) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id title { english romaji } coverImage { large } bannerImage description genres seasonYear episodes averageScore siteUrl
      }
    }
  }
`

const BY_GENRE = `
  query ($genre: [String], $perPage: Int, $sort: MediaSort) {
    Page(perPage: $perPage) {
      media(type: ANIME, genre_in: $genre, sort: $sort, status: FINISHED) {
        id title { english romaji } coverImage { large } bannerImage description genres seasonYear episodes averageScore siteUrl
      }
    }
  }
`

const TRENDING = `
  query ($perPage: Int) {
    Page(perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id title { english romaji } coverImage { large } bannerImage description genres seasonYear episodes averageScore siteUrl
      }
    }
  }
`

const SIMILAR = `
  query ($search: String, $perPage: Int) {
    Media(search: $search, type: ANIME) {
      id
      recommendations(perPage: $perPage, sort: RATING_DESC) {
        nodes { mediaRecommendation {
          id title { english romaji } coverImage { large } bannerImage description genres seasonYear episodes averageScore siteUrl
        }}
      }
    }
  }
`

export async function searchAnime(query: string, limit = 10): Promise<AnimeItem[]> {
  const key = cacheKey('search', query.toLowerCase().slice(0, 50))
  const cached = getCached<AnimeItem[]>(key)
  if (cached) return cached
  const data = await gql<{ Page?: { media?: unknown[] } }>(SEARCH, {
    search: query,
    perPage: limit,
  })
  const list = (data?.Page?.media || []) as Parameters<typeof mapMedia>[0][]
  const out = list.map(mapMedia)
  setCache(key, out)
  return out
}

const MOOD_TO_GENRE: Record<string, string[]> = {
  dark: ['Horror', 'Thriller', 'Psychological'],
  funny: ['Comedy'],
  comedy: ['Comedy'],
  romance: ['Romance'],
  action: ['Action'],
  short: [],
  underrated: [],
}

export async function getRecommendationsByMood(mood: string, limit = 10): Promise<AnimeItem[]> {
  const key = cacheKey('mood', mood)
  const cached = getCached<AnimeItem[]>(key)
  if (cached) return cached
  const genres = MOOD_TO_GENRE[mood.toLowerCase()] || ['Action']
  const sort = mood.toLowerCase() === 'underrated' ? 'SCORE_DESC' : 'POPULARITY_DESC'
  const data = await gql<{ Page?: { media?: unknown[] } }>(BY_GENRE, {
    genre: genres,
    perPage: limit,
    sort,
  })
  const list = (data?.Page?.media || []) as Parameters<typeof mapMedia>[0][]
  const out = list.map(mapMedia)
  setCache(key, out)
  return out
}

export async function getSimilarAnime(title: string, limit = 8): Promise<AnimeItem[]> {
  const key = cacheKey('similar', title.toLowerCase().slice(0, 40))
  const cached = getCached<AnimeItem[]>(key)
  if (cached) return cached
  const data = await gql<{ Media?: { recommendations?: { nodes?: { mediaRecommendation?: unknown }[] } } }>(SIMILAR, {
    search: title,
    perPage: limit,
  })
  const nodes = data?.Media?.recommendations?.nodes || []
  const out = nodes
    .map((n) => (n as { mediaRecommendation?: unknown }).mediaRecommendation)
    .filter(Boolean)
    .map((m) => mapMedia(m as Parameters<typeof mapMedia>[0]))
  setCache(key, out)
  return out
}

export async function getTopByGenre(genre: string, limit = 10): Promise<AnimeItem[]> {
  const key = cacheKey('genre', genre)
  const cached = getCached<AnimeItem[]>(key)
  if (cached) return cached
  const data = await gql<{ Page?: { media?: unknown[] } }>(BY_GENRE, {
    genre: [genre],
    perPage: limit,
    sort: 'POPULARITY_DESC',
  })
  const list = (data?.Page?.media || []) as Parameters<typeof mapMedia>[0][]
  const out = list.map(mapMedia)
  setCache(key, out)
  return out
}

export const CATEGORY_CHIPS = [
  { id: 'action', label: 'Action' },
  { id: 'dark', label: 'Dark' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'romance', label: 'Romance' },
  { id: 'short', label: 'Short' },
  { id: 'underrated', label: 'Underrated' },
] as const
