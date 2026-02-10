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
    const isBuild = /build|make|create/i.test(input.query)
    const count = isBuild ? 15 : 4
    const items = await provider.fetchTrending(count)
    if (items.length === 0) {
      return { kind: 'text', text: "I couldn't load a quiz right now. Try again in a moment." }
    }
    if (isBuild && items.length >= 5) {
      const questions: Array<{ question: string; options: string[]; correctIndex: number }> = []
      const used = new Set<number>()
      for (let i = 0; i < 5; i++) {
        let idx = Math.floor(Math.random() * items.length)
        while (used.has(idx)) idx = (idx + 1) % items.length
        used.add(idx)
        const pick = items[idx]
        const wrong = items.filter((a) => a.id !== pick.id).slice(0, 3).map((a) => a.title)
        const options = [pick.title, ...wrong].sort(() => Math.random() - 0.5)
        questions.push({
          question: `Which anime? "${(pick.synopsis || '').slice(0, 60)}..."`,
          options,
          correctIndex: options.indexOf(pick.title),
        })
      }
      logTool('animeQuiz', 'built batch', { count: questions.length })
      return { kind: 'quiz_batch', questions }
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
