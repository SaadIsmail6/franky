/**
 * Franky v2 – character intelligence tool.
 */

import type { ToolResult } from '../agent/types'
import type { AgentContext } from '../agent/types'
import type { ToolInputBase } from './types'
import { getAnimeDataProvider } from '../services/animeDataProvider'
import { logTool } from '../services/logger'

export async function run(
  input: ToolInputBase & { characterName?: string },
  _ctx: AgentContext
): Promise<ToolResult> {
  const provider = getAnimeDataProvider()
  const name = input.characterName ?? input.query.replace(/^(who is|tell me about|about)\s+/i, '').trim()
  if (!name) {
    return { kind: 'text', text: "Which character do you want to know about? Try: who is Gojo?" }
  }
  try {
    const char = await provider.fetchCharacter(name)
    if (!char) {
      return { kind: 'text', text: `I couldn't find a character named "${name}". Try the full name or series.` }
    }
    return {
      kind: 'match',
      characterName: char.name,
      animeTitle: char.animeTitle,
      confidence: 1,
      description: [char.role, ...char.traits].join('. '),
    }
  } catch (e) {
    logTool('animeCharacter', 'error', { error: String(e) })
    return { kind: 'text', text: `I couldn't look up "${name}" right now. Try again in a bit.` }
  }
}
