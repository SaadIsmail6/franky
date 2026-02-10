/**
 * Franky v2 – natural language formatter.
 * Converts tool results to chat text + optional miniapp payload.
 */

import type { ToolResult } from './types'
import type { AgentContext } from './types'
import { filterResponseText } from './safety'

export interface FormattedResponse {
  text: string
  miniappPayload?: { view: string; items?: unknown[]; animeIds?: string[]; source?: string; [key: string]: unknown }
  openMiniapp?: boolean
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
      const animeIds = items.map((a) => a.id).filter(Boolean) as string[]
      return {
        text: filterResponseText(text),
        miniappPayload: { view: 'recommendations', items, animeIds, source: 'agent' },
      }
    }
    case 'text':
      return { text: filterResponseText(result.text) }
    case 'clarify':
      return { text: result.question }
    case 'quiz':
      return {
        text: `${result.question}\n\nOptions: ${result.options.map((o, i) => `${i + 1}. ${o}`).join(', ')}\nReply with the number or title.`,
        miniappPayload: { view: 'quiz', question: result.question, options: result.options, correctIndex: result.correctIndex, source: 'agent' },
      }
    case 'quiz_batch': {
      const batch = result as { questions: Array<{ question: string; options: string[]; correctIndex: number }> }
      const first = batch.questions[0]
      const text = first
        ? `**Anime Quiz (5 questions)**\n\n1. ${first.question}\n\nOptions: ${first.options.map((o, i) => `${i + 1}. ${o}`).join(', ')}\n\n_…${batch.questions.length - 1} more in the app._`
        : "Here's your quiz — open the app to play."
      return {
        text,
        miniappPayload: { view: 'quiz', questions: batch.questions, source: 'agent' },
      }
    }
    case 'match':
      return {
        text: `**${result.characterName}** (${result.animeTitle}) — ${result.description} [${Math.round(result.confidence * 100)}% match]`,
      }
    case 'guide': {
      const steps = result.steps.map((s) => `${s.order}. ${s.title}${s.description ? ` — ${s.description}` : ''}`).join('\n')
      return {
        text: `**Watch order: ${result.seriesName}**\n\n${steps}`,
        miniappPayload: { view: 'watch_order', seriesName: result.seriesName, steps: result.steps },
      }
    }
    case 'open_ui':
      return { text: 'Opening Franky Anime UI 🎌', openMiniapp: true }
    case 'poll': {
      const poll = result as { question: string; options: string[] }
      return {
        text: `**Poll:** ${poll.question}\n\n${poll.options.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n_Vote by replying with the number._`,
        miniappPayload: { view: 'poll', question: poll.question, options: poll.options },
      }
    }
    default:
      return { text: "I'm not sure how to answer that. Try asking for a recommendation or what's trending." }
  }
}
