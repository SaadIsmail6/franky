/**
 * Franky v2 – rankings / tier list tool.
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
    const items = await provider.fetchTrending(10)
    const ranked = (items ?? []).map((a, i) => ({
      ...a,
      reason: `#${i + 1} in current trending`,
    }))
    return { kind: 'items', items: ranked }
  } catch (e) {
    logTool('animeRanking', 'error', { error: String(e) })
    return { kind: 'items', items: [] }
  }
}
