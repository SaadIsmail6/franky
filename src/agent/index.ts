/**
 * Franky v2 – agent entrypoint.
 * handleMessage: user message → intent → route → format → response.
 */

import { classifyIntent } from './intentClassifier'
import { route } from './router'
import { formatToolResult } from './formatter'
import { recordRecommendations } from './memory'
import * as safety from './safety'
import { logAgent } from '../services/logger'
import type { AgentContext } from './types'
import type { FormattedResponse } from './formatter'

export interface HandleMessageResult {
  shouldReply: boolean
  text?: string
  miniappPayload?: FormattedResponse['miniappPayload']
  openMiniapp?: boolean
}

export function handleMessage(message: string, ctx: AgentContext): Promise<HandleMessageResult> {
  const trimmed = message.trim()
  if (!trimmed) {
    return Promise.resolve({ shouldReply: false })
  }

  if (safety.containsExplicitRequest(trimmed) || safety.containsPiracyRequest(trimmed)) {
    return Promise.resolve({
      shouldReply: true,
      text: "I can't help with that. Ask me about anime recommendations, characters, or watch orders.",
    })
  }

  if (safety.isOffTopic(trimmed)) {
    return Promise.resolve({
      shouldReply: true,
      text: safety.getRedirectMessage(),
    })
  }

  if (safety.isAnimeOnlyReject(trimmed)) {
    return Promise.resolve({
      shouldReply: true,
      text: safety.ANIME_ONLY_MESSAGE,
    })
  }

  return (async () => {
    const classified = classifyIntent(trimmed)
    logAgent('intent', { intent: classified.intent, confidence: classified.confidence })

    const toolResult = await route(classified, ctx)
    if (toolResult.kind === 'items' && toolResult.items?.length) {
      recordRecommendations(ctx, toolResult.items)
    }
    const formatted = formatToolResult(toolResult, ctx)

    return {
      shouldReply: true,
      text: formatted.text,
      miniappPayload: formatted.miniappPayload,
      openMiniapp: formatted.openMiniapp,
    }
  })()
}
