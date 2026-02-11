# Farcaster Mini App SDK Reference

Primary docs: https://miniapps.farcaster.xyz

## Setup
- `npm install @farcaster/miniapp-sdk`
- After app loads **must** call `await sdk.actions.ready()` or splash screen hangs.

## Context (`sdk.context`)
- `context.user`: `fid`, `username`, `displayName`, `pfpUrl`
- `context.client`: `platformType` ('web'|'mobile'), `clientFid`, `added`, `safeAreaInsets`, `notificationDetails`
- `context.location`: how app was opened (cast_embed, cast_share, notification, launcher, channel, open_miniapp)

## Actions
- `sdk.actions.ready()` — hide splash (required)
- `sdk.actions.openUrl(url)` — open external URL
- `sdk.actions.close()` — close mini app
- `sdk.actions.composeCast({ text?, ... })` — prompt user to cast
- `sdk.actions.getCapabilities()` — returns list of supported capabilities
- `sdk.actions.getChains()` — supported chains
- `sdk.actions.addMiniApp()` — prompt user to add app
- `sdk.actions.viewProfile(fid)`, `viewCast(hash)`, `signin()`, etc.

## Wallet
- `sdk.wallet.getEthereumProvider()` — EIP-1193 provider
- `sdk.wallet.ethProviderRequest({ method, params })` — request

## Events
- Subscribe to host events via SDK events API.
