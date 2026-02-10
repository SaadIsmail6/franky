/**
 * Franky v2 – trivia tool.
 */

import type { ToolResult } from '../agent/types'
import type { AgentContext } from '../agent/types'
import type { ToolInputBase } from './types'
import { logTool } from '../services/logger'

const TRIVIA_FACTS = [
  'Studio Ghibli was co-founded by Hayao Miyazaki in 1985. Spirited Away won the Oscar for Best Animated Feature in 2003.',
  'One Piece has been running since 1999 and holds the record for the most copies published of a single manga series.',
  'Neon Genesis Evangelion (1995) is often credited with popularizing the "mind screw" and deconstruction genres in anime.',
]

export async function run(
  input: ToolInputBase,
  _ctx: AgentContext
): Promise<ToolResult> {
  try {
    const idx = Math.abs(input.query.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % TRIVIA_FACTS.length
    return { kind: 'text', text: TRIVIA_FACTS[idx] }
  } catch (e) {
    logTool('animeTrivia', 'error', { error: String(e) })
    return { kind: 'text', text: 'No trivia loaded. Ask again later.' }
  }
}
