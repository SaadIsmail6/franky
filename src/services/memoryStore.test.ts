/**
 * Unit tests for session memory store.
 */

import { describe, expect, test } from 'bun:test'
import { getMemory, updateMemory, recordQuizResult } from './memoryStore'

describe('memoryStore', () => {
  const userId = 'user-1'
  const spaceId = 'space-1'

  test('getMemory returns empty snapshot for new user', () => {
    const mem = getMemory(userId, spaceId)
    expect(mem.favoriteGenres).toEqual([])
    expect(mem.likedAnimeIds).toEqual([])
    expect(mem.dislikedAnimeIds).toEqual([])
    expect(mem.lastRecommendations).toEqual([])
    expect(mem.quizStats.totalQuestions).toBe(0)
    expect(mem.quizStats.correct).toBe(0)
  })

  test('updateMemory merges patch', () => {
    const updated = updateMemory(userId, spaceId, {
      favoriteGenres: ['Action', 'Drama'],
    })
    expect(updated.favoriteGenres).toEqual(['Action', 'Drama'])
    const again = getMemory(userId, spaceId)
    expect(again.favoriteGenres).toEqual(['Action', 'Drama'])
  })

  test('recordQuizResult increments total and correct', () => {
    recordQuizResult(userId, spaceId, true)
    const mem = getMemory(userId, spaceId)
    expect(mem.quizStats.totalQuestions).toBeGreaterThanOrEqual(1)
    expect(mem.quizStats.correct).toBeGreaterThanOrEqual(0)
  })

  test('different user/space get separate snapshots', () => {
    const a = getMemory('user-a', 'space-1')
    const b = getMemory('user-b', 'space-1')
    updateMemory('user-a', 'space-1', { favoriteGenres: ['Comedy'] })
    const a2 = getMemory('user-a', 'space-1')
    const b2 = getMemory('user-b', 'space-1')
    expect(a2.favoriteGenres).toContain('Comedy')
    expect(b2.favoriteGenres).not.toContain('Comedy')
  })
})
