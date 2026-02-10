/**
 * Franky v2 – in-memory session store.
 * Keyed by userId+spaceId; API ready for future Redis/DB.
 */

import type { MemorySnapshot } from '../agent/types'
import type { AnimeResult } from '../domain/types'

const store = new Map<string, MemorySnapshot>()

function key(userId: string, spaceId: string): string {
  return `${userId}:${spaceId}`
}

const emptySnapshot = (): MemorySnapshot => ({
  favoriteGenres: [],
  likedAnimeIds: [],
  dislikedAnimeIds: [],
  likedTitles: [],
  dislikedTitles: [],
  lastRecommendations: [],
  lastRecommended: [],
  quizStats: { totalQuestions: 0, correct: 0 },
  interactionCount: 0,
})

export function getMemory(userId: string, spaceId: string): MemorySnapshot {
  const k = key(userId, spaceId)
  const existing = store.get(k)
  if (existing) return existing
  const snapshot = emptySnapshot()
  store.set(k, snapshot)
  return snapshot
}

export function updateMemory(
  userId: string,
  spaceId: string,
  patch: Partial<MemorySnapshot>
): MemorySnapshot {
  const k = key(userId, spaceId)
  const current = store.get(k) ?? emptySnapshot()
  const next: MemorySnapshot = {
    ...current,
    ...patch,
    favoriteGenres: patch.favoriteGenres ?? current.favoriteGenres,
    likedAnimeIds: patch.likedAnimeIds ?? current.likedAnimeIds,
    dislikedAnimeIds: patch.dislikedAnimeIds ?? current.dislikedAnimeIds,
    likedTitles: patch.likedTitles ?? current.likedTitles,
    dislikedTitles: patch.dislikedTitles ?? current.dislikedTitles,
    lastRecommendations: patch.lastRecommendations ?? current.lastRecommendations,
    lastRecommended: patch.lastRecommended ?? current.lastRecommended,
    quizStats: patch.quizStats ?? current.quizStats,
    interactionCount: patch.interactionCount ?? current.interactionCount,
  }
  store.set(k, next)
  return next
}

export function recordRecommendations(
  userId: string,
  spaceId: string,
  items: AnimeResult[]
): void {
  updateMemory(userId, spaceId, {
    lastRecommendations: items.slice(0, 20),
    lastRecommended: items.slice(0, 20),
  })
}

export function recordLikedTitle(userId: string, spaceId: string, title: string): void {
  const mem = getMemory(userId, spaceId)
  const next = [...(mem.likedTitles || [])]
  if (!next.includes(title)) next.push(title)
  updateMemory(userId, spaceId, { likedTitles: next.slice(-50) })
}

export function recordDislikedTitle(userId: string, spaceId: string, title: string): void {
  const mem = getMemory(userId, spaceId)
  const next = [...(mem.dislikedTitles || [])]
  if (!next.includes(title)) next.push(title)
  updateMemory(userId, spaceId, { dislikedTitles: next.slice(-50) })
}

export function incrementInteractionCount(userId: string, spaceId: string): void {
  const mem = getMemory(userId, spaceId)
  updateMemory(userId, spaceId, { interactionCount: (mem.interactionCount || 0) + 1 })
}

const channelGenreHits = new Map<string, Record<string, number>>()

function channelKey(channelId: string): string {
  return channelId
}

export function getChannelGenreHits(channelId: string): Record<string, number> {
  return channelGenreHits.get(channelKey(channelId)) ?? {}
}

export function recordChannelGenre(channelId: string, genre: string): void {
  const k = channelKey(channelId)
  const cur = channelGenreHits.get(k) ?? {}
  channelGenreHits.set(k, { ...cur, [genre]: (cur[genre] ?? 0) + 1 })
}

export function recordQuizResult(
  userId: string,
  spaceId: string,
  correct: boolean
): void {
  const mem = getMemory(userId, spaceId)
  const { totalQuestions, correct: c } = mem.quizStats
  updateMemory(userId, spaceId, {
    quizStats: {
      totalQuestions: totalQuestions + 1,
      correct: c + (correct ? 1 : 0),
      lastScore: correct ? 1 : 0,
    },
  })
}
