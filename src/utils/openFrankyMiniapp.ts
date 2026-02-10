/**
 * Opens the Franky miniapp UI using Towns SDK actions when available.
 * Falls back to sending a message with a clickable link.
 */

import { MINIAPP_URL, MINIAPP_NAME } from '../config/miniapp'
import type { BotHandler } from '@towns-protocol/bot'

type HandlerWithActions = BotHandler & {
  actions?: { openUrl?: (url: string, name?: string) => void | Promise<void> }
}

/**
 * Try to open the miniapp via handler.actions.openUrl; otherwise no-op (caller can send link message).
 * Returns true if an open action was invoked, false otherwise.
 */
export async function openFrankyMiniapp(handler: BotHandler): Promise<boolean> {
  const withActions = handler as HandlerWithActions
  if (withActions?.actions?.openUrl && typeof withActions.actions.openUrl === 'function') {
    try {
      await Promise.resolve(withActions.actions.openUrl(MINIAPP_URL, MINIAPP_NAME))
      return true
    } catch (e) {
      console.error('[OPEN_MINIAPP] actions.openUrl failed', e)
      return false
    }
  }
  return false
}

/**
 * Message suffix that includes an "Open Franky UI" link for fallback when actions are not available.
 */
export function getOpenFrankyUILinkSuffix(): string {
  return `\n\n[Open Franky UI](${MINIAPP_URL})`
}
