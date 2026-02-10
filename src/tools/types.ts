/**
 * Franky v2 – tool input/output contracts.
 */

import type { MemorySnapshot } from '../agent/types'
import type { AnimeResult } from '../domain/types'

export interface ToolInputBase {
  query: string
  userId: string
  spaceId: string
  channelId: string
  memory: MemorySnapshot
}

export interface ToolResultBase {
  items: AnimeResult[]
  meta?: Record<string, unknown>
}
