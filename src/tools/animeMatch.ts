/**
 * Franky v2 – character match tool.
 */

import type { ToolResult } from '../agent/types'
import type { AgentContext } from '../agent/types'
import type { ToolInputBase } from './types'
import { logTool } from '../services/logger'

const PLACEHOLDER_MATCHES = [
  { name: 'Goku', anime: 'Dragon Ball Z', desc: 'Protagonist, determined, loves fighting and food.' },
  { name: 'Luffy', anime: 'One Piece', desc: 'Pirate captain, rubber powers, aims to be King of the Pirates.' },
  { name: 'Eren Yeager', anime: 'Attack on Titan', desc: 'Driven protagonist, Titan shifter, fights for freedom.' },
]

export async function run(
  input: ToolInputBase,
  _ctx: AgentContext
): Promise<ToolResult> {
  try {
    const idx = Math.abs(input.query.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % PLACEHOLDER_MATCHES.length
    const m = PLACEHOLDER_MATCHES[idx]
    return {
      kind: 'match',
      characterName: m.name,
      animeTitle: m.anime,
      confidence: 0.85,
      description: m.desc,
    }
  } catch (e) {
    logTool('animeMatch', 'error', { error: String(e) })
    return {
      kind: 'match',
      characterName: 'Unknown',
      animeTitle: '—',
      confidence: 0,
      description: 'Could not compute a match.',
    }
  }
}
