/**
 * Franky v2 – anime quiz tool.
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
  try {
    const provider = getAnimeDataProvider()
    const items = await provider.fetchTrending(4)
    if (items.length === 0) {
      return { kind: 'text', text: "I couldn't load a quiz right now. Try again in a moment." }
    }
    const pick = items[Math.floor(Math.random() * items.length)]
    const wrong = items.filter((a) => a.id !== pick.id).slice(0, 3).map((a) => a.title)
    const options = [pick.title, ...wrong].sort(() => Math.random() - 0.5)
    const correctIndex = options.indexOf(pick.title)
    return {
      kind: 'quiz',
      question: `Which anime is this? "${(pick.synopsis || '').slice(0, 80)}..."`,
      options,
      correctIndex,
    }
  } catch (e) {
    logTool('animeQuiz', 'error', { error: String(e) })
    return { kind: 'text', text: "Quiz unavailable right now. Try again later." }
  }
}
