/**
 * Franky v2 – intent classifier.
 * Keyword signals, genre/mood vocabulary, anime/character detection.
 */

import { Intent, type ClassifiedIntent } from './types'

const RECOMMEND_KEYWORDS = [
  'recommend', 'suggest', 'what should i watch', 'something to watch',
  'something like', 'similar to', 'like attack', 'like one piece',
  'short anime', 'long anime', 'dark anime', 'comfy', 'chill anime',
  'something dark', 'something light', 'wholesome', 'underrated',
]
const CHARACTER_KEYWORDS = ['who is', 'tell me about', 'character', 'about gojo', 'about goku']
const WATCH_ORDER_KEYWORDS = ['watch order', 'where do i start', 'order to watch', 'fate order', 'monogatari order']
const TRENDING_KEYWORDS = ['trending', 'popular now', 'what\'s hot', 'breaking', 'popular this week']
const SEASONAL_KEYWORDS = ['this season', 'seasonal', 'current season', 'new season', 'spring anime', 'fall anime']
const QUIZ_KEYWORDS = ['quiz', 'quiz me', 'test me', 'trivia game', 'anime quiz']
const MATCH_KEYWORDS = ['character match', 'match me', 'which character', 'who am i like']
const RANKING_KEYWORDS = ['ranking', 'rank', 'top anime', 'best anime', 'tier list', 'top 10']
const TRIVIA_KEYWORDS = ['trivia', 'fact', 'did you know', 'tell me a fact']

const GENRE_WORDS: Record<string, string> = {
  action: 'Action', shonen: 'Shounen', shoujo: 'Shoujo', seinen: 'Seinen', josei: 'Josei',
  romance: 'Romance', comedy: 'Comedy', drama: 'Drama', fantasy: 'Fantasy',
  scifi: 'Sci-Fi', 'sci-fi': 'Sci-Fi', horror: 'Horror', mystery: 'Mystery',
  'slice of life': 'Slice of Life', sol: 'Slice of Life', sports: 'Sports',
  supernatural: 'Supernatural', mecha: 'Mecha', isekai: 'Isekai',
}
const MOOD_WORDS: Record<string, string> = {
  dark: 'dark', light: 'light', comfy: 'comfy', chill: 'chill', intense: 'intense',
  emotional: 'emotional', wholesome: 'wholesome', brutal: 'brutal',
  'slow burn': 'slow-burn', 'short': 'short', 'long running': 'long',
}

function scoreKeyword(query: string, keywords: string[]): number {
  const lower = query.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    if (lower.includes(kw)) score += 1
  }
  return score
}

function extractGenresAndMoods(query: string): { genres: string[]; moods: string[] } {
  const lower = query.toLowerCase()
  const genres: string[] = []
  const moods: string[] = []
  for (const [key, value] of Object.entries(GENRE_WORDS)) {
    if (lower.includes(key)) genres.push(value)
  }
  for (const [key, value] of Object.entries(MOOD_WORDS)) {
    if (lower.includes(key)) moods.push(value)
  }
  return { genres, moods }
}

/** Heuristic: "like X" or "similar to X" → treat rest as title */
function detectSimilarTitle(query: string): string | undefined {
  const lower = query.toLowerCase().trim()
  const likeMatch = lower.match(/(?:like|similar to|something like)\s+(.+?)(?:\s+please)?\.?$/i)
  if (likeMatch) return likeMatch[1].trim()
  const recommendMatch = lower.match(/(?:recommend|suggest)\s+(.+?)(?:\s+please)?\.?$/i)
  if (recommendMatch) {
    const rest = recommendMatch[1].trim()
    if (rest.length > 2 && rest.length < 80) return rest
  }
  return undefined
}

/** Heuristic: "who is X" / "tell me about X" → X as character */
function detectCharacter(query: string): string | undefined {
  const lower = query.toLowerCase().trim()
  const whoMatch = lower.match(/(?:who is|tell me about|about)\s+(.+?)(?:\s+from)?\.?$/i)
  if (whoMatch) return whoMatch[1].trim()
  return undefined
}

export function classifyIntent(rawQuery: string): ClassifiedIntent {
  const trimmed = rawQuery.trim()
  if (!trimmed) {
    return { intent: Intent.UNKNOWN, confidence: 0, rawQuery: trimmed }
  }

  const { genres, moods } = extractGenresAndMoods(trimmed)
  const detectedTitle = detectSimilarTitle(trimmed)
  const detectedCharacter = detectCharacter(trimmed)

  const scores: Array<{ intent: Intent; score: number }> = [
    { intent: Intent.ANIME_RECOMMEND, score: scoreKeyword(trimmed, RECOMMEND_KEYWORDS) + (detectedTitle ? 2 : 0) },
    { intent: Intent.CHARACTER_INFO, score: scoreKeyword(trimmed, CHARACTER_KEYWORDS) + (detectedCharacter ? 2 : 0) },
    { intent: Intent.WATCH_ORDER, score: scoreKeyword(trimmed, WATCH_ORDER_KEYWORDS) },
    { intent: Intent.TRENDING, score: scoreKeyword(trimmed, TRENDING_KEYWORDS) },
    { intent: Intent.SEASONAL, score: scoreKeyword(trimmed, SEASONAL_KEYWORDS) },
    { intent: Intent.QUIZ, score: scoreKeyword(trimmed, QUIZ_KEYWORDS) },
    { intent: Intent.CHARACTER_MATCH, score: scoreKeyword(trimmed, MATCH_KEYWORDS) },
    { intent: Intent.RANKING, score: scoreKeyword(trimmed, RANKING_KEYWORDS) },
    { intent: Intent.TRIVIA, score: scoreKeyword(trimmed, TRIVIA_KEYWORDS) },
  ]

  scores.sort((a, b) => b.score - a.score)
  const top = scores[0]
  const confidence = top.score > 0 ? Math.min(0.5 + top.score * 0.2, 1) : 0.2

  const intent = top.score > 0 ? top.intent : Intent.GENERAL_ANIME_CHAT

  return {
    intent,
    confidence,
    detectedTitle,
    detectedCharacter: intent === Intent.CHARACTER_INFO ? detectedCharacter : undefined,
    genres: genres.length ? genres : undefined,
    moods: moods.length ? moods : undefined,
    rawQuery: trimmed,
  }
}
