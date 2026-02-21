# Franky — Towns Protocol Bot

**AI agents and developers:** See **[AGENTS.md](./AGENTS.md)** for the canonical reference. It covers stateless event processing, handler payloads, Bot Actions API, storage strategy, and patterns. Use it when editing this codebase.

---

A Towns bot for anime communities (recommendations, airings, quotes, miniapp). Built on the same patterns as the Quickstart example.

## What This Bot Does

- **Anime**: Recommendations, airings, quotes, trivia; natural-language agent (FRANKY_V2); Franky miniapp launcher
- **Slash commands**: `/help`, `/franky`, `/airing`, `/recommend`, `/quote`, `/guess_anime`, `/ban`, `/mute`, etc.
- **Greetings & mentions**: Responds to "Franky", "hi Franky", and @mentions
- **Moderation**: Admin-only ban/mute (per AGENTS.md permission patterns)

## Architecture (per AGENTS.md)

- **Stateless**: Each webhook event is isolated; no message history or thread content. Context (e.g. trivia state) is kept in memory (see [Storage Strategy](AGENTS.md#storage-strategy-decision-matrix) for production).
- **Event flow**: Webhook → JWT → decrypt → route (slash vs `onMessage`) → handler → response.
- **User IDs**: Always `0x...` addresses; mentions use `mentions: [{ userId, displayName }]` and message text `<@userId>`.

## Setup

1. Copy `.env.sample` to `.env` and fill in your credentials
2. Install dependencies: `yarn install`
3. Run the bot: `yarn dev`

## Environment Variables

- `APP_PRIVATE_DATA`: Your Towns app private data
- `JWT_SECRET`: JWT secret for authentication
- `PORT`: Port to run the bot on (optional, defaults to 5123)
- **`BASE_MAINNET_RPC_URL`** (optional but recommended for production): Base mainnet RPC URL. If unset, the Towns SDK uses a default public endpoint that can hit **429 Bandwidth limit exceeded** on deploy (e.g. Render). Set this to a URL with higher limits (e.g. from [Alchemy](https://alchemy.com), [Infura](https://infura.io), or [QuickNode](https://quicknode.com) for Base) to avoid "Bot still initializing" and webhooks failing to complete init.

## Usage

Once the bot is running in a channel:

- **Slash commands**: `/help`, `/franky`, `/airing`, `/recommend`, `/quote`
- Type **Franky** or **open franky** → Opens the anime miniapp
- Mention @Franky and ask in natural language (with `FRANKY_V2=true`): e.g. *what should I watch*, *something like Attack on Titan*
- **Admin**: `/ban @user`, `/mute @user` (require admin permission per AGENTS.md)

## Code Structure

- **`src/index.ts`**: Bot init (with retry for Base RPC), `onMessage` / `onSlashCommand` routing, safeSendMessage, webhook server.
- **`src/commands.ts`**: Slash command definitions and execution (payload shape matches AGENTS.md). Uses `bot.sendMessage()` from a timer for trivia timeout (per "Using Bot Methods Outside Handlers").
- **`src/towns/`**, **`src/agent/`**: V2 agent and Towns handlers.
- **`miniapp/`**: Franky Anime UI (Farcaster Mini App SDK, AniList, neon theme).

For full handler reference, types, and patterns, see **[AGENTS.md](./AGENTS.md)**.

## Franky Mini App (AnimeTown)

The Franky anime agent runs as a Towns/Farcaster Mini App with neon AnimeTown-style UI.

### Run the mini app locally

1. From the repo root: `cd miniapp`
2. Install: `npm install` or `bun install`
3. Dev server: `npm run dev` or `bun run dev`
4. Open the URL shown (e.g. `http://localhost:5173`). In Towns, set `MINIAPP_URL` to your deployed miniapp URL.

### Dev mode

Append `?dev=true` to the miniapp URL to show the debug panel (context, SDK capabilities, wallet status).

### Launch from chat

Type **Franky** (or **open franky**, **launch franky**) in a channel where the bot is present to open the mini app.
