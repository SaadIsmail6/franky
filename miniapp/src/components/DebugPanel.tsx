import React, { useState, useEffect } from 'react'
import { neon } from '../theme/neon'
import { getContext, getCapabilities, getEthereumProvider, ethProviderRequest } from '../sdk'

export function DebugPanel() {
  const [walletStatus, setWalletStatus] = useState<string>('—')
  const context = getContext()
  const caps = getCapabilities()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const provider = getEthereumProvider()
      if (!provider) {
        setWalletStatus('No wallet provider')
        return
      }
      try {
        const accounts = await ethProviderRequest({ method: 'eth_accounts', params: [] })
        if (cancelled) return
        setWalletStatus(Array.isArray(accounts) && accounts.length ? `Connected (${(accounts as string[]).length} account(s))` : 'Not connected')
      } catch (e) {
        if (!cancelled) setWalletStatus(e instanceof Error ? e.message : 'Error')
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        background: neon.bg.elevated,
        borderRadius: 12,
        border: neon.border.glass,
        fontSize: 12,
        color: neon.text.muted,
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', color: neon.text.secondary, fontSize: 14 }}>Debug (?dev=true)</h3>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify({ context, capabilities: caps, wallet: walletStatus }, null, 2)}
      </pre>
    </div>
  )
}
