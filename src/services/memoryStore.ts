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
  lastRecommendations: [],
  quizStats: { totalQuestions: 0, correct: 0 },
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
    lastRecommendations: patch.lastRecommendations ?? current.lastRecommendations,
    quizStats: patch.quizStats ?? current.quizStats,
  }
  store.set(k, next)
  return next
}

export function recordRecommendations(
  userId: string,
  spaceId: string,
  items: AnimeResult[]
): void {
  const mem = getMemory(userId, spaceId)
  updateMemory(userId, spaceId, {
    lastRecommendations: items.slice(0, 20),
  })
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
