/**
 * Franky v2 – recommendation tool.
 * Mood + genre + pacing → ranked anime list with reasons.
 */

import type { ToolResult } from '../agent/types'
import type { AgentContext } from '../agent/types'
import type { ToolInputBase } from './types'
import { getAnimeDataProvider } from '../services/animeDataProvider'
import { getChannelGenreHits, recordChannelGenre } from '../services/memoryStore'
import { logTool } from '../services/logger'

const MOOD_TO_GENRE: Record<string, string> = {
  dark: 'Horror', comfy: 'Slice of Life', chill: 'Slice of Life', intense: 'Action',
  emotional: 'Drama', wholesome: 'Slice of Life', brutal: 'Action', 'slow-burn': 'Drama',
}

export async function run(
  input: ToolInputBase & {
    characterName?: string
    detectedTitle?: string
    genres?: string[]
    moods?: string[]
  },
  _ctx: AgentContext
): Promise<ToolResult> {
  const provider = getAnimeDataProvider()
  try {
    if (input.query.trim().length === 0) {
      return { kind: 'items', items: [] }
    }
    let items: Awaited<ReturnType<typeof provider.searchByFilters>>
    const detectedTitle = input.detectedTitle
    if (detectedTitle) {
      items = await provider.getRecommendationsByTitle(detectedTitle, 10)
      if (items.length === 0) {
        items = await provider.searchByTitle(detectedTitle, 10)
      }
    } else {
      const fromMemory = input.memory?.favoriteGenres?.length ? input.memory.favoriteGenres : []
      const fromClassifier = input.genres ?? []
      const fromMoods = (input.moods ?? []).map((m) => MOOD_TO_GENRE[m.toLowerCase()]).filter(Boolean) as string[]
      const channelHits = _ctx?.channelId ? getChannelGenreHits(_ctx.channelId) : {}
      const channelGenres = Object.entries(channelHits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([g]) => g)
      const genres = [...new Set([...fromMemory, ...fromClassifier, ...fromMoods, ...channelGenres])]
      if (_ctx?.channelId && fromClassifier.length) {
        fromClassifier.forEach((g) => recordChannelGenre(_ctx.channelId, g))
      }
      items = await provider.searchByFilters({
        genres: genres.length ? genres : undefined,
        limit: 8,
      })
      if (items.length === 0) {
        items = await provider.fetchTrending(8)
      }
    }
    const filtered = (items ?? []).filter((a) => !input.memory?.dislikedAnimeIds?.includes(a.id))
    return { kind: 'items', items: filtered.slice(0, 8) }
  } catch (e) {
    logTool('animeRecommend', 'error', { error: String(e) })
    return { kind: 'items', items: [] }
  }
}
