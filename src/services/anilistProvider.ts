/**
 * Franky v2 – AniList GraphQL implementation of AnimeDataProvider.
 * Maps all responses to AnimeResult; never exposes raw API data.
 */

import type { AnimeDataProvider } from './animeDataProvider'
import type { AnimeResult } from '../domain/types'
import { PLACEHOLDER_COVER_URL, PLACEHOLDER_BANNER_URL } from '../domain/types'
import { logData, logError } from './logger'

const ANILIST_GRAPHQL = 'https://graphql.anilist.co'
const CACHE_TTL_MS = 90_000

function pickTitle(t: { english?: string | null; romaji?: string | null; native?: string | null } | null | undefined): string {
  if (!t) return 'Unknown'
  return t.english || t.romaji || t.native || 'Unknown'
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()
    .slice(0, 500)
}

function mapMediaToAnimeResult(media: Record<string, unknown>, reason: string): AnimeResult {
  const id = String(media.id ?? '')
  const title = pickTitle(media.title as Parameters<typeof pickTitle>[0])
  const cover = (media.coverImage as { large?: string; medium?: string } | undefined)?.large
    || (media.coverImage as { large?: string; medium?: string } | undefined)?.medium
  const banner = (media.bannerImage as string | undefined) || undefined
  return {
    id,
    title,
    synopsis: stripHtml(media.description as string),
    genres: Array.isArray(media.genres) ? (media.genres as string[]) : [],
    year: (media.seasonYear as number) ?? undefined,
    episodes: (media.episodes as number) ?? undefined,
    rating: (media.averageScore as number) ?? undefined,
    coverImageUrl: (cover && typeof cover === 'string') ? cover : PLACEHOLDER_COVER_URL,
    bannerImageUrl: (banner && typeof banner === 'string') ? banner : undefined,
    reason,
    externalUrl: (media.siteUrl as string) || `https://anilist.co/anime/${id}`,
  }
}

async function anilistRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ANILIST_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    throw new Error(`AniList API ${res.status}: ${res.statusText}`)
  }
  const json = (await res.json()) as { data?: T; errors?: unknown[] }
  if (json.errors?.length) {
    logError('anilistProvider', 'GraphQL errors', json.errors)
    throw new Error('AniList returned errors')
  }
  return json.data as T
}

const TRENDING_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC, status: RELEASING) {
        id title { english romaji native } description(asHtml: false)
        genres seasonYear episodes averageScore coverImage { large medium } bannerImage siteUrl
      }
    }
  }
`

const SEASONAL_QUERY = `
  query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC) {
        id title { english romaji native } description(asHtml: false)
        genres seasonYear episodes averageScore coverImage { large medium } bannerImage siteUrl
      }
    }
  }
`

const SEARCH_TITLE_QUERY = `
  query ($search: String, $perPage: Int) {
    Page(perPage: $perPage) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id title { english romaji native } description(asHtml: false)
        genres seasonYear episodes averageScore coverImage { large medium } bannerImage siteUrl
      }
    }
  }
`

const SEARCH_FILTERS_QUERY = `
  query ($genre: [String], $episodesLesser: Int, $episodesGreater: Int, $perPage: Int, $page: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, genre_in: $genre, episodes_lesser: $episodesLesser, episodes_greater: $episodesGreater, sort: POPULARITY_DESC, status: FINISHED) {
        id title { english romaji native } description(asHtml: false)
        genres seasonYear episodes averageScore coverImage { large medium } bannerImage siteUrl
      }
    }
  }
`

const CHARACTER_QUERY = `
  query ($search: String) {
    Character(search: $search) {
      id name { full native }
      image { large }
      media(sort: POPULARITY_DESC, perPage: 1) {
        nodes {
          title { english romaji }
        }
      }
      description(asHtml: false)
    }
  }
`

const RECOMMENDATIONS_QUERY = `
  query ($search: String, $perPage: Int) {
    Media(search: $search, type: ANIME) {
      id title { english romaji native } description(asHtml: false)
      genres seasonYear episodes averageScore coverImage { large medium } bannerImage siteUrl
      recommendations(perPage: $perPage, sort: RATING_DESC) {
        nodes { mediaRecommendation {
          id title { english romaji native } description(asHtml: false)
          genres seasonYear episodes averageScore coverImage { large medium } bannerImage siteUrl
        }}
      }
    }
  }
`

type CacheEntry = { data: unknown; expiresAt: number }
const cache = new Map<string, CacheEntry>()

function getCached<T>(key: string): T | null {
  const ent = cache.get(key)
  if (!ent || Date.now() > ent.expiresAt) {
    cache.delete(key)
    return null
  }
  return ent.data as T
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

/** Predefined watch orders (no AniList API for this) */
const WATCH_ORDERS: Record<string, { order: number; title: string; description?: string }[]> = {
  fate: [
    { order: 1, title: 'Fate/Zero', description: 'Prequel; best starting point' },
    { order: 2, title: 'Fate/stay night: Unlimited Blade Works', description: 'UBW route' },
    { order: 3, title: 'Fate/stay night: Heaven\'s Feel (movies)', description: 'HF route' },
  ],
  monogatari: [
    { order: 1, title: 'Bakemonogatari' },
    { order: 2, title: 'Nisemonogatari' },
    { order: 3, title: 'Nekomonogatari Kuro' },
    { order: 4, title: 'Monogatari Series Second Season' },
    { order: 5, title: 'Hanamonogatari' },
    { order: 6, title: 'Tsukimonogatari' },
    { order: 7, title: 'Owarimonogatari' },
    { order: 8, title: 'Koyomimonogatari' },
    { order: 9, title: 'Zoku Owarimonogatari' },
  ],
}

export class AniListAnimeDataProvider implements AnimeDataProvider {
  async getRecommendationsByTitle(title: string, limit = 10): Promise<AnimeResult[]> {
    try {
      const data = await anilistRequest<{
        Media?: {
          recommendations?: { nodes?: { mediaRecommendation?: Record<string, unknown> }[] }
        }
      }>(RECOMMENDATIONS_QUERY, { search: title, perPage: Math.min(limit, 15) })
      const nodes = data?.Media?.recommendations?.nodes ?? []
      const results = nodes
        .map((n) => n.mediaRecommendation)
        .filter((m): m is Record<string, unknown> => !!m)
        .map((m) => mapMediaToAnimeResult(m, `Similar to "${title}"`))
      logData('anilistProvider', 'getRecommendationsByTitle', { query: title.slice(0, 30), count: results.length })
      return results
    } catch (e) {
      logError('anilistProvider', 'getRecommendationsByTitle', e)
      return []
    }
  }

  async searchByTitle(title: string, limit = 10): Promise<AnimeResult[]> {
    try {
      const data = await anilistRequest<{ Page?: { media?: unknown[] } }>(SEARCH_TITLE_QUERY, {
        search: title,
        perPage: Math.min(limit, 20),
      })
      const list = data?.Page?.media ?? []
      const results = (list as Record<string, unknown>[]).map((m) =>
        mapMediaToAnimeResult(m, `Matches "${title}"`)
      )
      logData('anilistProvider', 'searchByTitle', { query: title.slice(0, 30), count: results.length })
      return results
    } catch (e) {
      logError('anilistProvider', 'searchByTitle', e)
      return []
    }
  }

  async searchByFilters(filters: {
    genres?: string[]
    moods?: string[]
    episodeMax?: number
    episodeMin?: number
    limit?: number
  }): Promise<AnimeResult[]> {
    try {
      const genre = filters.genres?.length ? filters.genres : undefined
      const data = await anilistRequest<{ Page?: { media?: unknown[] } }>(SEARCH_FILTERS_QUERY, {
        genre,
        episodesLesser: filters.episodeMax,
        episodesGreater: filters.episodeMin,
        perPage: Math.min(filters.limit ?? 10, 20),
        page: 1,
      })
      const list = data?.Page?.media ?? []
      const results = (list as Record<string, unknown>[]).map((m) =>
        mapMediaToAnimeResult(m, genre ? `Genre: ${genre.join(', ')}` : 'Popular picks')
      )
      logData('anilistProvider', 'searchByFilters', { count: results.length })
      return results
    } catch (e) {
      logError('anilistProvider', 'searchByFilters', e)
      return []
    }
  }

  async fetchTrending(limit = 10): Promise<AnimeResult[]> {
    const key = `trending:${limit}`
    const cached = getCached<AnimeResult[]>(key)
    if (cached) return cached
    try {
      const data = await anilistRequest<{ Page?: { media?: unknown[] } }>(TRENDING_QUERY, {
        page: 1,
        perPage: Math.min(limit, 20),
      })
      const list = data?.Page?.media ?? []
      const results = (list as Record<string, unknown>[]).map((m, i) =>
        mapMediaToAnimeResult(m, `#${i + 1} trending this week`)
      )
      setCache(key, results)
      logData('anilistProvider', 'fetchTrending', { count: results.length })
      return results
    } catch (e) {
      logError('anilistProvider', 'fetchTrending', e)
      return []
    }
  }

  async fetchSeasonal(season?: string, year?: number, limit = 10): Promise<AnimeResult[]> {
    const s = season?.toUpperCase() || currentSeason()
    const y = year || new Date().getFullYear()
    const key = `seasonal:${s}:${y}:${limit}`
    const cached = getCached<AnimeResult[]>(key)
    if (cached) return cached
    try {
      const data = await anilistRequest<{ Page?: { media?: unknown[] } }>(SEASONAL_QUERY, {
        season: s,
        year: y,
        page: 1,
        perPage: Math.min(limit, 20),
      })
      const list = data?.Page?.media ?? []
      const results = (list as Record<string, unknown>[]).map((m, i) =>
        mapMediaToAnimeResult(m, `${s} ${y} — #${i + 1}`)
      )
      setCache(key, results)
      logData('anilistProvider', 'fetchSeasonal', { season: s, year: y, count: results.length })
      return results
    } catch (e) {
      logError('anilistProvider', 'fetchSeasonal', e)
      return []
    }
  }

  async fetchCharacter(name: string): Promise<{
    name: string
    role: string
    traits: string[]
    animeTitle: string
    imageUrl?: string
  } | null> {
    try {
      const data = await anilistRequest<{ Character?: Record<string, unknown> }>(CHARACTER_QUERY, {
        search: name,
      })
      const c = data?.Character
      if (!c) return null
      const fullName = (c.name as { full?: string; native?: string })?.full
        || (c.name as { full?: string; native?: string })?.native
        || name
      const mediaNodes = (c.media as { nodes?: { title?: { english?: string; romaji?: string } }[] })?.nodes
      const animeTitle = mediaNodes?.[0]?.title?.english || mediaNodes?.[0]?.title?.romaji || 'Unknown'
      const desc = stripHtml((c.description as string) || '').slice(0, 300)
      const traits = desc ? [desc] : []
      const imageUrl = (c.image as { large?: string })?.large
      return {
        name: fullName,
        role: 'Character',
        traits,
        animeTitle,
        imageUrl,
      }
    } catch (e) {
      logError('anilistProvider', 'fetchCharacter', e)
      return null
    }
  }

  async fetchSeriesGuide(seriesName: string): Promise<{ steps: { order: number; title: string; description?: string }[] } | null> {
    const key = seriesName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    const steps = WATCH_ORDERS[key] ?? WATCH_ORDERS[seriesName.toLowerCase()]
    if (steps) return { steps }
    if (key.includes('fate')) return { steps: WATCH_ORDERS.fate }
    if (key.includes('monogatari')) return { steps: WATCH_ORDERS.monogatari }
    return null
  }
}

function currentSeason(): string {
  const m = new Date().getMonth()
  if (m >= 2 && m <= 4) return 'SPRING'
  if (m >= 5 && m <= 7) return 'SUMMER'
  if (m >= 8 && m <= 10) return 'FALL'
  return 'WINTER'
}
