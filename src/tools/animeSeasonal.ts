/**
 * Franky v2 – seasonal anime tool.
 */

import type { ToolResult } from '../agent/types'
import type { AgentContext } from '../agent/types'
import type { ToolInputBase } from './types'
import { getAnimeDataProvider } from '../services/animeDataProvider'
import { logTool } from '../services/logger'

export async function run(
  input: ToolInputBase,
  _ctx: AgentContext
): Promise<ToolResult> {
  const provider = getAnimeDataProvider()
  try {
    const items = await provider.fetchSeasonal(undefined, undefined, 10)
    return { kind: 'items', items: items ?? [] }
  } catch (e) {
    logTool('animeSeasonal', 'error', { error: String(e) })
    return { kind: 'items', items: [] }
  }
}
