/**
 * Franky v2 – natural language formatter.
 * Converts tool results to chat text + optional miniapp payload.
 */

import type { ToolResult } from './types'
import type { AgentContext } from './types'
import { filterResponseText } from './safety'

export interface FormattedResponse {
  text: string
  miniappPayload?: { view: string; items?: unknown[]; [key: string]: unknown }
}

export function formatToolResult(
  result: ToolResult,
  _ctx: AgentContext
): FormattedResponse {
  switch (result.kind) {
    case 'items': {
      const items = result.items ?? []
      if (items.length === 0) {
        return { text: "I couldn't find anything matching that. Try a different vibe or title." }
      }
      const lines = items.slice(0, 6).map((a, i) => `${i + 1}. **${a.title}** — ${a.reason || 'Recommended'}`)
      const text = 'Here are some picks:\n\n' + lines.join('\n') + (items.length > 6 ? '\n\n_More in the app._' : '')
      return {
        text: filterResponseText(text),
        miniappPayload: { view: 'recommendations', items },
      }
    }
    case 'text':
      return { text: filterResponseText(result.text) }
    case 'clarify':
      return { text: result.question }
    case 'quiz':
      return {
        text: `${result.question}\n\nOptions: ${result.options.map((o, i) => `${i + 1}. ${o}`).join(', ')}\nReply with the number or title.`,
        miniappPayload: { view: 'quiz', question: result.question, options: result.options, correctIndex: result.correctIndex },
      }
    case 'match':
      return {
        text: `**${result.characterName}** (${result.animeTitle}) — ${result.description} [${Math.round(result.confidence * 100)}% match]`,
      }
    case 'guide': {
      const steps = result.steps.map((s) => `${s.order}. ${s.title}${s.description ? ` — ${s.description}` : ''}`).join('\n')
      return { text: `**Watch order: ${result.seriesName}**\n\n${steps}` }
    }
    default:
      return { text: "I'm not sure how to answer that. Try asking for a recommendation or what's trending." }
  }
}
