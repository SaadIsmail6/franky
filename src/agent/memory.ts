/**
 * Franky v2 – session memory API.
 * Wraps memoryStore and exposes get/update/recordFeedback/recordQuizResult.
 */

import * as memoryStore from '../services/memoryStore'
import type { AgentContext } from './types'
import type { AnimeResult } from '../domain/types'

export function getMemory(ctx: AgentContext): ReturnType<typeof memoryStore.getMemory> {
  return memoryStore.getMemory(ctx.userId, ctx.spaceId)
}

export function updateMemory(
  ctx: AgentContext,
  patch: Parameters<typeof memoryStore.updateMemory>[2]
): ReturnType<typeof memoryStore.updateMemory> {
  return memoryStore.updateMemory(ctx.userId, ctx.spaceId, patch)
}

export function recordRecommendations(ctx: AgentContext, items: AnimeResult[]): void {
  memoryStore.recordRecommendations(ctx.userId, ctx.spaceId, items)
}

export function recordQuizResult(ctx: AgentContext, correct: boolean): void {
  memoryStore.recordQuizResult(ctx.userId, ctx.spaceId, correct)
}
