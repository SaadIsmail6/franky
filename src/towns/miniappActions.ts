/**
 * Franky v2 – Towns Miniapp required actions.
 * ready, openUrl, close, composeCast, getCapabilities, getChains, wallet helpers.
 */

export type MiniappActions = {
  ready?: () => void | Promise<void>
  openUrl?: (url: string) => void | Promise<void>
  close?: () => void | Promise<void>
  composeCast?: (payload: { text?: string; [key: string]: unknown }) => void | Promise<void>
  getCapabilities?: () => { capabilities: string[] }
  getChains?: () => { chains: unknown[] }
}

export type WalletHelpers = {
  getEthereumProvider?: () => unknown
  ethProviderRequest?: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

let actions: MiniappActions = {}
let wallet: WalletHelpers = {}

export function setMiniappActions(a: MiniappActions): void {
  actions = a
}

export function setWalletHelpers(w: WalletHelpers): void {
  wallet = w
}

export function getMiniappActions(): MiniappActions {
  return actions
}

export function getWalletHelpers(): WalletHelpers {
  return wallet
}

/** Default no-op implementations for required actions (miniapp will override) */
export function createDefaultMiniappActions(): MiniappActions {
  return {
    ready() {
      console.log('[MINIAPP] ready')
    },
    openUrl(url: string) {
      if (typeof window !== 'undefined' && window.open) {
        window.open(url, '_blank')
      }
    },
    close() {
      console.log('[MINIAPP] close')
    },
    composeCast(payload: { text?: string }) {
      console.log('[MINIAPP] composeCast', payload?.text ?? '')
    },
    getCapabilities() {
      return { capabilities: ['openUrl', 'composeCast'] }
    },
    getChains() {
      return { chains: [] }
    },
  }
}

export function createDefaultWalletHelpers(): WalletHelpers {
  return {
    getEthereumProvider() {
      return null
    },
    async ethProviderRequest() {
      return null
    },
  }
}
