/**
 * Franky v2 – anime poll creator.
 * Builds poll options from AniList trending; records votes in memory.
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
    const items = await provider.fetchTrending(5)
    if (items.length < 2) {
      return { kind: 'text', text: "Couldn't load enough anime for a poll. Try again in a moment." }
    }
    const options = items.map((a) => a.title)
    const question = 'Which of these is the best anime?'
    logTool('animePoll', 'created', { optionCount: options.length })
    return { kind: 'poll', question, options }
  } catch (e) {
    logTool('animePoll', 'error', { error: String(e) })
    return { kind: 'text', text: "Couldn't create a poll right now. Try again later." }
  }
}
