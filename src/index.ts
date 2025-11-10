import { makeTownsBot, type BotHandler } from '@towns-protocol/bot'
import { Hono } from 'hono'
import type { PlainMessage, SlashCommand } from '@towns-protocol/proto'
import {
    commands,
    activeTriviaGames,
    checkTriviaAnswer,
    type CommandDefinition,
    type SlashCommandEventPayload,
} from './commands'
import { registerSlashCommandsPortable } from './registry'

const SLASH_COMMAND_NAME_REGEX = /^[A-Za-z0-9_]+$/
const SLASH_ALIAS_MAP: Record<string, string> = {
    'guess-anime': 'guess_anime',
}
const allCommandNames = commands.map((command) => command.name)
const invalidCommandNames = allCommandNames.filter((name) => !SLASH_COMMAND_NAME_REGEX.test(name))
if (invalidCommandNames.length > 0) {
    console.error('[REGISTRY] invalid command names:', invalidCommandNames.join(', '))
}
const validCommandNames = allCommandNames.filter((name) => SLASH_COMMAND_NAME_REGEX.test(name))
const validCommandDefinitions = commands.filter((definition) =>
    SLASH_COMMAND_NAME_REGEX.test(definition.name)
)
const commandMetadata = validCommandDefinitions.map(({ name, description }) => ({
    name,
    description,
})) as PlainMessage<SlashCommand>[]
const describeCommand = (name: string) => {
    const command = commands.find((definition) => definition.name === name)
    if (!command) {
        return { name, description: 'command' }
    }
    return {
        name: command.name,
        description: command.description || 'command',
    }
}

/**
 * Franky - Towns Protocol Bot for Anime Communities
 * Webhook handler hands off directly to SDK without preprocessing
 */

// ============================================================================
// UTILITIES
// ============================================================================

function truncateText(text: string, maxLen: number = 80): string {
    if (text.length <= maxLen) return text
    return text.substring(0, maxLen) + '...'
}

// ============================================================================
// MODERATION
// ============================================================================

const SCAM_KEYWORDS = [
    'free nitro', 'nitro giveaway', 'discord nitro', 'claim nitro', 'nitro reward',
    'claim airdrop', 'free airdrop', 'airdrop reward', 'claim your airdrop',
    'seed phrase', 'private key', 'mnemonic', 'wallet seed', 'recover wallet',
    'claim reward', 'claim your reward', 'free money', 'crypto giveaway',
    'click here to claim', 'verify your wallet', 'connect wallet to claim',
]

function isScamOrSpam(message: string): boolean {
    const lower = message.toLowerCase()
    return SCAM_KEYWORDS.some(keyword => lower.includes(keyword.toLowerCase()))
}

// ============================================================================
// TRIVIA GAME
// ============================================================================

// ============================================================================
// BOT STATE
// ============================================================================

let bot: Awaited<ReturnType<typeof makeTownsBot>> | null = null
let jwtMiddleware: any = null
let webhookHandler: any = null
let webhookApp: Hono | null = null // Initialize ONCE after bot.start()
const startTime = Date.now()
let slashRegistrationStatus: 'unknown' | 'registered' | 'skipped' = 'unknown'

// ============================================================================
// BOT HANDLERS SETUP
// ============================================================================

// Helper to wrap sendMessage with logging and error handling
async function safeSendMessage(
    handler: BotHandler,
    channelId: string,
    message: string,
    opts?: Parameters<BotHandler['sendMessage']>[2]
): Promise<void> {
    const textPreview = truncateText(message)
    console.log(`[REPLY] to channel=${channelId} text="${textPreview}"`)
    
    try {
        await handler.sendMessage(channelId, message, opts)
    } catch (error) {
        const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : 'unknown'
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`[SEND-ERROR] code=${errorCode} message="${errorMessage}"`)
        throw error // Re-throw so callers can handle if needed
    }
}

function setupBotHandlers(bot: Awaited<ReturnType<typeof makeTownsBot>>) {
    bot.onChannelJoin(async (_, { channelId }) => {
        console.log(`Franky joined channel: ${channelId}`)
    })

    const commandMap = new Map<string, CommandDefinition>(
        commands.map((definition) => [definition.name, definition])
    )
    const adminCommands = new Set(['ban', 'mute', 'purge', 'guess_anime'])
    const aliasLog = new Set<string>()

    const isLikelySlashCommandEvent = (event: any): boolean => {
        const tags = event?.tags
        if (Array.isArray(tags)) {
            return tags.some((tag) =>
                tag?.messageInteractionType === 'SLASH_COMMAND' ||
                tag?.messageInteractionType === 'MESSAGE_INTERACTION_TYPE_SLASH_COMMAND'
            )
        }
        if (typeof event?.messageInteractionType === 'string') {
            return event.messageInteractionType.toUpperCase?.() === 'SLASH_COMMAND'
        }
        return false
    }

    type TextCommandEvent = {
        message: string
        channelId: string
        userId: string
        spaceId: string
        eventId: string
        mentions: SlashCommandEventPayload['mentions']
        replyId?: string
        threadId?: string
    }

    const handleTextCommand = async (
        handler: BotHandler,
        event: TextCommandEvent
    ): Promise<boolean> => {
        const slashTagged = isLikelySlashCommandEvent(event)
        if (slashRegistrationStatus === 'registered' && slashTagged) {
            return false
        }
        if (slashTagged && slashRegistrationStatus !== 'registered') {
            console.log('[TEXTCMD] handling slash-tagged message via compatibility mode')
        }
        const trimmed = event.message.trim()
        if (!trimmed.startsWith('/')) {
            return false
        }
        const withoutSlash = trimmed.slice(1)
        if (withoutSlash.length === 0) {
            return false
        }
        const parts = withoutSlash.split(/\s+/)
        const rawCommand = parts.shift()
        if (!rawCommand) {
            return false
        }
        const normalized = rawCommand.toLowerCase().replace(/-/g, '_')
        const command = commandMap.get(normalized)
        if (!command) {
            return false
        }

        const args = parts
        const argsJoined = args.join(' ')
        console.log(`[TEXTCMD] /${normalized} args="${argsJoined}"`)

        if (adminCommands.has(normalized)) {
            const hasPermission = await handler.hasAdminPermission(event.userId, event.spaceId)
            if (!hasPermission) {
                console.log(`[TEXTCMD] denied /${normalized} user=${event.userId}`)
                await safeSendMessage(
                    handler,
                    event.channelId,
                    `You don't have permission for /${normalized}`
                )
                return true
            }
        }

        const commandEvent: SlashCommandEventPayload = {
            channelId: event.channelId,
            userId: event.userId,
            spaceId: event.spaceId,
            eventId: event.eventId,
            command: normalized,
            args,
            mentions: event.mentions,
            replyId: event.replyId,
            threadId: event.threadId,
        }

        try {
            await command.execute({
                handler,
                event: commandEvent,
                safeSendMessage,
                bot,
                startTime,
            })
        } catch (error) {
            console.error(`[COMMAND ERROR] /${normalized}`, error)
        }
        return true
    }

    bot.onMessage(async (handler, { message, channelId, eventId, userId, spaceId, isMentioned, mentions, replyId, threadId }) => {
        // Log event summary
        const textPreview = truncateText(message)
        console.log(`[EVENT] type=message channel=${channelId || ''} author=${userId || ''} text=${textPreview}`)

        // Ignore self-messages
        if (userId === bot!.botId) return

        const textCmdHandled = await handleTextCommand(handler, {
            message,
            channelId,
            userId,
            spaceId,
            eventId,
            mentions,
            replyId,
            threadId,
        })
        if (textCmdHandled) {
            return
        }

        // Trivia check
        const game = activeTriviaGames.get(channelId)
        if (game && !game.hasWinner && checkTriviaAnswer(message, game.answer)) {
            game.hasWinner = true
            clearTimeout(game.timeoutId)
            activeTriviaGames.delete(channelId)
            await safeSendMessage(handler, channelId, `✅ Correct, <@${userId}>! Answer: ${game.answer}`, {
                mentions: [{ userId, displayName: 'Winner', mentionBehavior: { case: undefined } }],
            })
            return
        }

        // Mentions - case-insensitive check for "@franky" or bot name
        const lower = message.toLowerCase()
        // Check for @franky (with @) or just "franky" (already handled by isMentioned flag)
        const mentioned = isMentioned || lower.includes('@franky') || lower.includes('franky')
        if (mentioned) {
            if (lower.includes('hi') || lower.includes('hello')) {
                await safeSendMessage(handler, channelId, 'Hi there 👋')
                return
            }
            if (lower.includes('who are you franky')) {
                await safeSendMessage(handler, channelId, "I'm Franky, the super cyborg of AnimeTown!🌸")
                return
            }
            if (lower.includes('bye franky')) {
                await safeSendMessage(handler, channelId, 'See ya later!')
                return
            }
            if (lower.includes('thanks franky') || lower.includes('thank you franky')) {
                await safeSendMessage(handler, channelId, 'Anytime, nakama! 🙌')
                return
            }
        }

        // Moderation
        if (isScamOrSpam(message)) {
            const isAdmin = await handler.hasAdminPermission(userId, spaceId)
            if (isAdmin) return

            // Check redaction permission (4 = Redact, but SDK might expect different format)
            // Try to check permission - if checkPermission fails, we'll still try to delete
            let canRedact = false
            try {
                // @ts-expect-error - Permission enum may not be exported, using numeric value
                canRedact = await handler.checkPermission(channelId, bot!.botId, 4)
            } catch {
                // If permission check fails, assume we can try (bot will error if it can't)
                canRedact = true
            }
            if (canRedact) {
                await handler.adminRemoveEvent(channelId, eventId)
                console.log(`[${new Date().toISOString()}] 🛡️ Deleted scam/spam from ${userId}`)
            }
        }
    })
    
    const invokeCommand = async (
        canonicalName: string,
        handler: BotHandler,
        event: SlashCommandEventPayload,
        incomingName: string
    ) => {
        const definition = commandMap.get(canonicalName)
        if (!definition) {
            console.error(`[COMMAND ERROR] missing definition for /${canonicalName}`)
            return
        }
        const argsJoined = event.args.join(' ')
        console.log(`[SLASH] /${incomingName} args="${argsJoined}"`)
        console.log(`[RUN] /${definition.name} executed by ${event.userId}`)
        try {
            await definition.execute({
                handler,
                event: { ...event, command: definition.name },
                safeSendMessage,
                bot,
                startTime,
            })
        } catch (error) {
            console.error(`[COMMAND ERROR] /${definition.name}`, error)
        }
    }

    for (const definition of commandMap.values()) {
        bot.onSlashCommand(definition.name as typeof definition.name, async (handler, event) => {
            await invokeCommand(definition.name, handler, event as SlashCommandEventPayload, event.command)
        })
    }

    for (const [alias, canonical] of Object.entries(SLASH_ALIAS_MAP)) {
        bot.onSlashCommand(alias as typeof alias, async (handler, event) => {
            if (!aliasLog.has(alias)) {
                console.log(`[SLASH] deprecated alias ${alias} -> ${canonical}`)
                aliasLog.add(alias)
            }
            await invokeCommand(canonical, handler, event as SlashCommandEventPayload, event.command)
        })
    }
}

// ============================================================================
// BOT INITIALIZATION
// ============================================================================

console.log('[START] loading commands from commands.ts')

makeTownsBot(process.env.APP_PRIVATE_DATA!, process.env.JWT_SECRET!, { commands: commandMetadata })
    .then(async (initializedBot) => {
        bot = initializedBot
        console.log('[DEBUG] bot keys:', Object.keys(bot ?? {}))
        const botApp = (bot as unknown as { app?: Record<string, unknown> })?.app
        if (botApp) {
            console.log('[DEBUG] bot.app keys:', Object.keys(botApp))
        }

        setupBotHandlers(bot)

        const webhook = bot.start()
        jwtMiddleware = webhook.jwtMiddleware
        webhookHandler = webhook.handler
        console.log(
            '[DEBUG] webhook keys:',
            Object.keys(webhook ?? {}),
            'handlerType=',
            typeof webhookHandler,
            'jwtType=',
            typeof jwtMiddleware
        )
        
        // Initialize Hono webhook app ONCE (not per-request)
        webhookApp = new Hono()
        webhookApp.use(async (c, next) => {
            console.log('[WEBHOOK-PATH]', c.req.method, c.req.path)
            await next()
        })
        // Register both /webhook and /webhook/ to handle trailing slash
        webhookApp.post('/webhook', async (c) => {
            if (!jwtMiddleware || !webhookHandler) {
                console.warn('[WEBHOOK] handler not ready, returning fallback 200')
                return c.text('OK', 200)
            }
            let response: Response | undefined
            try {
                await jwtMiddleware(c, async () => {
                    const handled = await webhookHandler(c)
                    if (handled instanceof Response) {
                        response = handled
                    }
                })
            } catch (error) {
                console.error('[WEBHOOK ERROR]', error)
                if (error instanceof Error && error.stack) {
                    console.error('[WEBHOOK ERROR] Stack trace:', error.stack)
                }
                return c.text('Webhook failed', 500)
            }
            if (!response) {
                return c.text('OK', 200)
            }
            return response
        })
        
        console.log('✅ Bot initialized successfully')
        const namesToRegister = validCommandNames
        if (namesToRegister.length === 0) {
            console.warn('[REGISTRY] no valid slash command names to register')
            slashRegistrationStatus = 'skipped'
            return
        }
        try {
            console.log('[START] registering slash commands:', namesToRegister.join(', '))
            const result = await registerSlashCommandsPortable(bot, namesToRegister, describeCommand)
            slashRegistrationStatus = result
            if (result === 'skipped') {
                console.log('[REGISTRY] running in text-command compatibility mode (slash registration skipped)')
            } else {
                console.log('[REGISTRY] slash commands registered; compatibility mode on standby')
            }
        } catch (error) {
            console.error('[REGISTRY] failed', error)
            slashRegistrationStatus = 'skipped'
            console.log('[REGISTRY] falling back to text-command compatibility mode')
        }
    })
    .catch((error) => {
        // Suppress ConnectError - it's non-fatal
        const isConnectError = error instanceof Error && 
            (error.message?.includes('Connect') || 
             error.constructor?.name === 'ConnectError' ||
             error.stack?.includes('connect-error'))
        
        if (isConnectError) {
            console.warn('⚠️ Connection warning (non-fatal, bot may still work)')
        } else {
            console.error('⚠️ Bot initialization error:', error instanceof Error ? error.message : String(error))
        }
    })

// ============================================================================
// ENVIRONMENT VALIDATION - Exit if missing required vars
// ============================================================================

if (!process.env.APP_PRIVATE_DATA || !process.env.JWT_SECRET) {
    console.error('❌ FATAL: Missing required environment variables')
    console.error('Required: APP_PRIVATE_DATA, JWT_SECRET')
    console.error('Please set these environment variables before starting the bot.')
    process.exit(1)
}

// ============================================================================
// SERVER - Bun.serve with bulletproof webhook handler
// ============================================================================

// Guard against double initialization
declare global {
    // eslint-disable-next-line no-var
    var __FRANKY_SERVER_STARTED: boolean | undefined
}

if (globalThis.__FRANKY_SERVER_STARTED) {
    console.warn('⚠️ Server already initialized, skipping')
} else {
    globalThis.__FRANKY_SERVER_STARTED = true
    
    const port = Number(process.env.PORT || 3000)

    Bun.serve({
    hostname: '0.0.0.0',
    port,
    fetch: async (req: Request) => {
        const url = new URL(req.url)
        const path = url.pathname
        const method = req.method
        
        // Log every request
        console.log(`[REQ] ${method} ${path}`)

        // GET /
        if (method === 'GET' && path === '/') {
            return new Response('Franky is running ✅', { status: 200 })
        }

        // GET /health
        if (method === 'GET' && path === '/health') {
            const uptime = Math.floor((Date.now() - startTime) / 1000)
            return new Response(JSON.stringify({ ok: true, uptime, ts: new Date().toISOString() }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // POST /webhook or POST /webhook/ - handle webhook requests
        if (path === '/webhook' || path === '/webhook/') {
            // Safe mode: immediately return 200 without calling SDK
            if (process.env.WEBHOOK_ALWAYS_200 === 'true') {
                console.log('[SAFE MODE] Returning 200 without SDK call')
                console.log('[WEBHOOK] 200')
                return new Response('OK', { status: 200 })
            }

            // Only POST is allowed on /webhook paths
            if (method !== 'POST') {
                return new Response('Method not allowed', { status: 405 })
            }

            // Check if webhook app is ready (never return 503 to Towns)
            if (!webhookApp) {
                console.log('[WEBHOOK] Bot still initializing, returning 200')
                return new Response('OK: initializing', { status: 200 })
            }

            // Call pre-initialized Hono webhook app (don't pre-read req.body)
            try {
                const targetReq =
                    path === '/webhook/'
                        ? new Request(new URL('/webhook', url).toString(), req)
                        : req
                const res = await webhookApp.fetch(targetReq)
                
                // Ensure we return a Response object
                if (!(res instanceof Response)) {
                    console.log('[WEBHOOK] 200 (wrapped non-Response)')
                    if (process.env.FRANKY_DEBUG === 'true') {
                        console.log('[WEBHOOK] 200 handled')
                    }
                    return new Response('OK', { status: 200 })
                }
                
                // Check SDK response status
                const status = res.status || 200
                console.log(`[WEBHOOK] ${status}`)
                
                // Towns requires HTTP 200 OK - return SDK response if 200, otherwise normalize to 200
                if (status === 200) {
                    if (process.env.FRANKY_DEBUG === 'true') {
                        console.log('[WEBHOOK] 200 handled')
                    }
                    return res
                }
                
                // SDK returned non-200 - log warning and return 200 OK (Towns requirement)
                console.warn(`[WEBHOOK] Warning: SDK returned ${status}, normalizing to 200 OK`)
                if (process.env.FRANKY_DEBUG === 'true') {
                    console.log('[WEBHOOK] 200 handled')
                }
                return new Response('OK', { status: 200 })
            } catch (error) {
                // Fatal error - log with stack trace and return 500
                console.error('[WEBHOOK ERROR]', error)
                if (error instanceof Error && error.stack) {
                    console.error('[WEBHOOK ERROR] Stack trace:', error.stack)
                }
                console.log('[WEBHOOK] 500')
                return new Response('Webhook failed', { status: 500 })
            }
        }

        // 404 for all other routes
        return new Response('Not found', { status: 404 })
    },
    })

    console.log(`Listening on :${port}`)
}

export {}
