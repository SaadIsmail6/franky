/**
 * Farcaster Mini App SDK wrapper. Call ready() after UI loads.
 * Towns context extensions: context.towns.* when running in Towns.
 */

export type TownsContext = {
  userId?: string
  address?: string
  env?: string
  spaceId?: string
  channelId?: string
}

export type AppContext = {
  user?: { username?: string; displayName?: string; pfpUrl?: string; fid?: number }
  towns?: TownsContext
}

let sdk: typeof import('@farcaster/miniapp-sdk').sdk | null = null
let context: AppContext = {}
let capabilities: string[] = []

export function getSdk(): typeof import('@farcaster/miniapp-sdk').sdk | null {
  return sdk
}

export function getContext(): AppContext {
  return context
}

export function getCapabilities(): string[] {
  return capabilities
}

export function getDisplayName(): string {
  const u = context.user
  if (u?.displayName) return u.displayName
  if (u?.username) return u.username
  return 'there'
}

export async function initSdk(): Promise<void> {
  try {
    const mod = await import('@farcaster/miniapp-sdk')
    sdk = mod.sdk
    if (sdk?.context) {
      const c = sdk.context as Record<string, unknown>
      context = {
        user: c.user as AppContext['user'],
        towns: c.towns as TownsContext,
      }
    }
    if (typeof sdk?.getCapabilities === 'function') {
      capabilities = (await sdk.getCapabilities()) || []
    }
  } catch {
    context = {}
    capabilities = []
  }
}

export async function sdkReady(): Promise<void> {
  if (sdk?.actions?.ready) {
    await sdk.actions.ready()
  }
}

export async function openUrl(url: string): Promise<void> {
  if (sdk?.actions?.openUrl) await sdk.actions.openUrl(url)
  else window.open(url, '_blank')
}

export async function close(): Promise<void> {
  if (sdk?.actions?.close) await sdk.actions.close()
}

export async function composeCast(opts: { text?: string }): Promise<void> {
  if (sdk?.actions?.composeCast) await sdk.actions.composeCast(opts)
}

export function getEthereumProvider(): unknown {
  return (sdk as unknown as { wallet?: { getEthereumProvider?: () => unknown } })?.wallet?.getEthereumProvider?.() ?? null
}

export function ethProviderRequest(args: { method: string; params?: unknown[] }): Promise<unknown> {
  const w = (sdk as unknown as { wallet?: { ethProviderRequest?: (a: unknown) => Promise<unknown> } })?.wallet
  if (w?.ethProviderRequest) return w.ethProviderRequest(args)
  return Promise.resolve(null)
}
