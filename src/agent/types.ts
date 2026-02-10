/**
 * Franky v2 – agent layer types.
 */

import type { AnimeResult } from '../domain/types'

export enum Intent {
  ANIME_RECOMMEND = 'ANIME_RECOMMEND',
  CHARACTER_INFO = 'CHARACTER_INFO',
  WATCH_ORDER = 'WATCH_ORDER',
  TRENDING = 'TRENDING',
  SEASONAL = 'SEASONAL',
  QUIZ = 'QUIZ',
  CHARACTER_MATCH = 'CHARACTER_MATCH',
  RANKING = 'RANKING',
  TRIVIA = 'TRIVIA',
  GENERAL_ANIME_CHAT = 'GENERAL_ANIME_CHAT',
  UNKNOWN = 'UNKNOWN',
}

export interface ClassifiedIntent {
  intent: Intent
  confidence: number
  detectedTitle?: string
  detectedCharacter?: string
  genres?: string[]
  moods?: string[]
  rawQuery: string
}

export interface MemorySnapshot {
  favoriteGenres: string[]
  likedAnimeIds: string[]
  dislikedAnimeIds: string[]
  lastRecommendations: AnimeResult[]
  quizStats: { totalQuestions: number; correct: number; lastScore?: number }
  tonePreference?: 'chill' | 'hype' | 'neutral'
}

export interface AgentContext {
  userId: string
  displayName?: string
  username?: string
  spaceId: string
  channelId: string
  address?: string
  env?: string
}

export type ToolResult =
  | { kind: 'items'; items: AnimeResult[]; meta?: Record<string, unknown> }
  | { kind: 'text'; text: string; meta?: Record<string, unknown> }
  | { kind: 'clarify'; question: string }
  | { kind: 'quiz'; question: string; options: string[]; correctIndex: number; meta?: Record<string, unknown> }
  | { kind: 'match'; characterName: string; animeTitle: string; confidence: number; description: string; meta?: Record<string, unknown> }
  | { kind: 'guide'; steps: { order: number; title: string; description?: string }[]; seriesName: string }
