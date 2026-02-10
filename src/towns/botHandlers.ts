/**
 * Franky v2 – Towns Bot SDK integration.
 * Builds AgentContext from context and routes messages to the agent.
 */

import { handleMessage } from '../agent'
import type { AgentContext } from '../agent/types'

const FRANKY_V2_TRIGGER = /@franky|franky/i
const FRANKY_V2_ENABLED = process.env.FRANKY_V2 === 'true'

export function buildAgentContext(from: {
  userId: string
  displayName?: string
  username?: string
  spaceId: string
  channelId: string
  address?: string
  env?: string
}): AgentContext {
  return {
    userId: from.userId,
    displayName: from.displayName,
    username: from.username,
    spaceId: from.spaceId,
    channelId: from.channelId,
    address: from.address,
    env: from.env,
  }
}

export function shouldUseV2Agent(message: string): boolean {
  if (!FRANKY_V2_ENABLED) return false
  return FRANKY_V2_TRIGGER.test(message) || message.trim().toLowerCase().startsWith('what should i watch')
}

export async function handleV2Message(
  message: string,
  context: { userId: string; displayName?: string; username?: string; spaceId: string; channelId: string; address?: string; env?: string }
): Promise<{ text?: string; miniappPayload?: unknown; openMiniapp?: boolean } | null> {
  const ctx = buildAgentContext(context)
  const result = await handleMessage(message, ctx)
  if (!result.shouldReply || !result.text) return null
  return { text: result.text, miniappPayload: result.miniappPayload, openMiniapp: result.openMiniapp }
}
