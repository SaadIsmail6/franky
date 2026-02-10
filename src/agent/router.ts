/**
 * Franky v2 – tool router.
 * Maps intents to tools; returns clarification when ambiguous.
 */

import { Intent } from './types'
import type { AgentContext } from './types'
import type { ClassifiedIntent } from './types'
import type { ToolResult } from './types'
import { getMemory } from './memory'
import * as animeRecommend from '../tools/animeRecommend'
import * as animeTrending from '../tools/animeTrending'
import * as animeSeasonal from '../tools/animeSeasonal'
import * as animeCharacter from '../tools/animeCharacter'
import * as animeGuide from '../tools/animeGuide'
import * as animeQuiz from '../tools/animeQuiz'
import * as animeMatch from '../tools/animeMatch'
import * as animeRanking from '../tools/animeRanking'
import * as animeTrivia from '../tools/animeTrivia'
import * as animePoll from '../tools/animePoll'
import { logTool } from '../services/logger'
import { checkRateLimit, recordRateLimit } from '../utils/rateLimit'

export async function route(
  classified: ClassifiedIntent,
  ctx: AgentContext
): Promise<ToolResult> {
  const memory = getMemory(ctx)
  const query = classified.rawQuery

  if (classified.intent === Intent.ANIME_RECOMMEND && classified.confidence < 0.5) {
    const hasPrefs = (classified.genres?.length ?? 0) > 0 || (classified.moods?.length ?? 0) > 0 || classified.detectedTitle
    if (!hasPrefs && memory.lastRecommendations.length === 0) {
      return {
        kind: 'clarify',
        question: 'What vibe are you in? Dark and intense, or something comfy? Short (1 cour) or longer?',
      }
    }
  }

  switch (classified.intent) {
    case Intent.ANIME_RECOMMEND: {
      logTool('animeRecommend', 'routing', { query: query.slice(0, 50), detectedTitle: classified.detectedTitle, genres: classified.genres })
      return animeRecommend.run({
        query,
        memory,
        detectedTitle: classified.detectedTitle,
        genres: classified.genres,
        moods: classified.moods,
        ...ctx,
      }, ctx)
    }
    case Intent.CHARACTER_INFO: {
      logTool('animeCharacter', 'routing', { character: classified.detectedCharacter })
      return animeCharacter.run({ query, memory, characterName: classified.detectedCharacter, ...ctx }, ctx)
    }
    case Intent.WATCH_ORDER: {
      logTool('animeGuide', 'routing', { query: query.slice(0, 50) })
      return animeGuide.run({ query, memory, ...ctx }, ctx)
    }
    case Intent.TRENDING: {
      logTool('animeTrending', 'routing', {})
      return animeTrending.run({ query, memory, ...ctx }, ctx)
    }
    case Intent.SEASONAL: {
      logTool('animeSeasonal', 'routing', {})
      return animeSeasonal.run({ query, memory, ...ctx }, ctx)
    }
    case Intent.QUIZ: {
      if (checkRateLimit(ctx.channelId, 'quiz')) {
        return { kind: 'text', text: 'Wait a bit before starting another quiz.' }
      }
      logTool('animeQuiz', 'routing', {})
      const quizResult = await animeQuiz.run({ query, memory, ...ctx }, ctx)
      if (quizResult.kind === 'quiz' || quizResult.kind === 'quiz_batch') recordRateLimit(ctx.channelId, 'quiz')
      return quizResult
    }
    case Intent.CHARACTER_MATCH: {
      logTool('animeMatch', 'routing', {})
      return animeMatch.run({ query, memory, ...ctx }, ctx)
    }
    case Intent.RANKING: {
      logTool('animeRanking', 'routing', { query: query.slice(0, 50) })
      return animeRanking.run({ query, memory, ...ctx }, ctx)
    }
    case Intent.TRIVIA: {
      logTool('animeTrivia', 'routing', {})
      return animeTrivia.run({ query, memory, ...ctx }, ctx)
    }
    case Intent.OPEN_UI: {
      return { kind: 'open_ui' }
    }
    case Intent.POLL: {
      if (checkRateLimit(ctx.channelId, 'poll')) {
        return { kind: 'text', text: 'Wait a bit before creating another poll.' }
      }
      logTool('animePoll', 'routing', {})
      const pollResult = await animePoll.run({ query, memory, ...ctx }, ctx)
      if (pollResult.kind === 'poll') recordRateLimit(ctx.channelId, 'poll')
      return pollResult
    }
    case Intent.COMPARE: {
      logTool('router', 'compare -> recommend', {})
      return animeRecommend.run({ query, memory, ...ctx }, ctx)
    }
    case Intent.GENERAL_ANIME_CHAT:
    case Intent.UNKNOWN:
    default: {
      logTool('router', 'fallback to recommend', {})
      return animeRecommend.run({ query, memory, ...ctx }, ctx)
    }
  }
}
