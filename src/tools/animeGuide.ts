/**
 * Franky v2 – watch order guide tool.
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
  const query = input.query.replace(/watch order for|order for|order to watch\s+/i, '').trim() || 'fate'
  try {
    const guide = await provider.fetchSeriesGuide(query)
    if (!guide || !guide.steps.length) {
      return { kind: 'text', text: `I don't have a watch order for "${query}" yet. I cover Fate, Monogatari, and a few others — ask for one of those by name.` }
    }
    return { kind: 'guide', seriesName: query, steps: guide.steps }
  } catch (e) {
    logTool('animeGuide', 'error', { error: String(e) })
    return { kind: 'text', text: `Couldn't load the guide for "${query}". Try again later.` }
  }
}
