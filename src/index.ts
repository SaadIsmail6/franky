import { makeTownsBot } from '@towns-protocol/bot'
import { Hono } from 'hono'
import commands from './commands'
import { getAiringInfo, getRecommendations } from './anilist'

/**
 * Franky - Towns Protocol Bot for Anime Communities
 * Webhook handler hands off directly to SDK without preprocessing
 */

// ============================================================================
// UTILITIES
// ============================================================================

function formatETA(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`
    if (hours > 0) return `~${hours}h`
    return minutes > 0 ? `~${minutes}m` : 'soon'
}

function truncateText(text: string, maxLength: number = 80): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
}

async function safeSendMessage(
    handler: any,
    channelId: string,
    message: string,
    opts?: any
): Promise<void> {
    const preview = truncateText(message)
    console.log(`[REPLY] to channel=${channelId} text="${preview}"`)
    try {
        await handler.sendMessage(channelId, message, opts)
    } catch (error) {
        const code = (error as any)?.code || 'unknown'
        const msg = error instanceof Error ? error.message : String(error)
        console.error(`[SEND-ERROR] code=${code} message="${msg}"`)
        throw error // Re-throw so caller can handle if needed
    }
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

const activeTriviaGames = new Map<string, {
    answer: string
    clue: string
    hasWinner: boolean
    timeoutId: NodeJS.Timeout
}>()

const TRIVIA_QUESTIONS = [
    { clue: 'What anime features a young ninja with a nine-tailed fox sealed inside him?', answer: 'Naruto' },
    { clue: 'In which anime do humans fight giant humanoid creatures called Titans behind three massive walls?', answer: 'Attack on Titan' },
    { clue: 'What anime follows Izuku Midoriya as he trains to become the world\'s greatest hero?', answer: 'My Hero Academia' },
    { clue: 'Which anime features a boy who can turn into a Titan and fights to protect humanity?', answer: 'Attack on Titan' },
    { clue: 'What shonen anime follows a team of ninjas from the Hidden Leaf Village?', answer: 'Naruto' },
]

function checkTriviaAnswer(message: string, answer: string): boolean {
    return message.toLowerCase().trim().includes(answer.toLowerCase().trim())
}

// ============================================================================
// ANIME QUOTES
// ============================================================================

const ANIME_QUOTES = [
    { quote: 'People live their lives bound by what they accept as correct and true. That\'s how they define reality.', character: 'Itachi Uchiha' },
    { quote: 'Wake up to reality! Nothing ever goes as planned in this world.', character: 'Madara Uchiha' },
    { quote: 'If you don\'t like your destiny, don\'t accept it. Instead, have the courage to change it the way you want it to be.', character: 'Naruto Uzumaki' },
    { quote: 'A dropout will beat a genius through hard work.', character: 'Rock Lee' },
    { quote: 'A true master is an eternal student.', character: 'Kenshin Himura' },
    { quote: 'The sword that kills is also the sword that saves. That is what the reverse blade is for.', character: 'Kenshin Himura' },
    { quote: 'A lesson without pain is meaningless. That\'s because no one can gain without sacrificing something.', character: 'Edward Elric' },
    { quote: 'A human\'s life span is too short to leave regrets behind.', character: 'Alphonse Elric' },
    { quote: 'There\'s no such thing as a painless lesson. They just don\'t exist. Sacrifices are necessary. You can\'t gain anything without losing something first.', character: 'Edward Elric' },
    { quote: 'Stand up and walk. Keep moving forward. You\'ve got two good legs.', character: 'Edward Elric' },
    { quote: 'To know sorrow is not terrifying. What is terrifying is to know you can\'t go back to happiness you could have.', character: 'Matsumoto Rangiku' },
    { quote: 'If you want to know who you are, you have to look at your real self and acknowledge what you see.', character: 'Urahara Kisuke' },
    { quote: 'Reject common sense to make the impossible possible.', character: 'Kamina' },
    { quote: 'Don\'t believe in yourself. Believe in me! Believe in the Kamina who believes in you!', character: 'Kamina' },
    { quote: 'The world is not perfect, but it\'s there for us trying the best it can.', character: 'Spike Spiegel' },
    { quote: 'Whatever happens, happens.', character: 'Spike Spiegel' },
    { quote: 'It\'s not about whether you win or lose, it\'s how good you looked doing it.', character: 'Spike Spiegel' },
    { quote: 'No matter how hard or impossible it is, never lose sight of your goal.', character: 'Monkey D. Luffy' },
    { quote: 'I don\'t want to conquer anything. I just think the guy with the most freedom in this whole ocean... is the Pirate King!', character: 'Monkey D. Luffy' },
    { quote: 'I am a man who wants to become a swordsman that can cut nothing.', character: 'Zoro Roronoa' },
    { quote: 'When do you think people die? When they are shot through the heart? No. When they are ravaged by an incurable disease? No. It\'s when they are forgotten.', character: 'Dr. Hiriluk' },
    { quote: 'The difference between the novice and the master is that the master has failed more times than the novice has tried.', character: 'Koro-sensei' },
    { quote: 'Even if we forget the faces of our friends, we will never forget the bonds that were carved into our souls.', character: 'Ichigo Kurosaki' },
    { quote: 'If you don\'t take risks, you can\'t create a future!', character: 'Monkey D. Luffy' },
    { quote: 'Being weak is nothing to be ashamed of. Staying weak is!', character: 'Fuegoleon Vermillion' },
    { quote: 'The moment you think of giving up, think of the reason why you held on so long.', character: 'Natsu Dragneel' },
    { quote: 'Sometimes life is like this tunnel. You can\'t always see the light at the end of the tunnel, but if you keep moving, you will come to a better place.', character: 'Iroh' },
    { quote: 'In the darkest times, hope is something you give yourself. That is the meaning of inner strength.', character: 'Iroh' },
    { quote: 'It is important to draw wisdom from different places. If you take it from only one place, it becomes rigid and stale.', character: 'Iroh' },
    { quote: 'Pride is not the opposite of shame, but its source. True humility is the only antidote to shame.', character: 'Iroh' },
    { quote: 'You are stronger than you believe. You have greater powers than you know.', character: 'Aang' },
    { quote: 'There\'s nothing wrong with letting people who love you help you.', character: 'Uncle Iroh' },
]

// ============================================================================
// BOT STATE
// ============================================================================

let bot: Awaited<ReturnType<typeof makeTownsBot>> | null = null
let jwtMiddleware: any = null
let webhookHandler: any = null
let webhookApp: Hono | null = null // Initialize ONCE after bot.start()
const startTime = Date.now()

// ============================================================================
// BOT HANDLERS SETUP
// ============================================================================

function setupBotHandlers(bot: Awaited<ReturnType<typeof makeTownsBot>>) {
    bot.onChannelJoin(async (_, { channelId }) => {
        console.log(`Franky joined channel: ${channelId}`)
    })

    bot.onMessage(async (handler, { message, channelId, eventId, userId, spaceId, isMentioned }) => {
        // Log event summary
        const msgPreview = truncateText(message)
        console.log(`[EVENT] type=message channel=${channelId || ''} author=${userId || ''} text=${msgPreview}`)

        // Ignore self-messages
        if (userId === bot!.botId) {
            console.log(`[EVENT] Ignoring self-message from bot`)
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

        // Mentions - case-insensitive check for "@franky" or "franky"
        const lower = message.toLowerCase()
        const botNameLower = 'franky'
        // Check for mention or name match (case-insensitive)
        const mentioned = isMentioned || 
                         lower.includes(`@${botNameLower}`) || 
                         lower.includes(botNameLower)
        
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

    // Slash commands
    bot.onSlashCommand('help', async (handler, event) => {
        const { channelId, args } = event
        console.log(`[SLASH] /help args="${(args || []).join(' ')}"`)
        await safeSendMessage(
            handler,
        channelId,
            'Franky — Commands\n\n' +
            '• /airing <title>\n' +
            '• /recommend <vibe>\n' +
            '• /quote\n' +
            '• /guess_anime\n' +
            '• /news\n' +
            '• /calendar\n\n' +
            'Moderation (admins):\n\n' +
            '• /ban @user • /mute @user 10m • /purge 25'
        )
    })

    bot.onSlashCommand('airing', async (handler, event) => {
        const { channelId, args } = event
        console.log(`[SLASH] /airing args="${(args || []).join(' ')}"`)
        const title = (args || []).join(' ').trim()
        if (!title) {
            await safeSendMessage(handler, channelId, 'Usage: `/airing <title>`\nExample: `/airing One Piece`')
            return
        }
        try {
            const info = await getAiringInfo(title)
            if (!info) {
                await safeSendMessage(handler, channelId, 'Not found. Try a different title.')
                return
            }
            if (info.nextEpisode !== null && info.timeUntilSeconds !== null) {
                const eta = formatETA(info.timeUntilSeconds)
                await safeSendMessage(handler, channelId, `📺 ${info.title}\nNext ep: ~${eta} | #${info.nextEpisode}\n${info.siteUrl}`)
            } else {
                await safeSendMessage(handler, channelId, `📺 ${info.title}\nNo upcoming episode info.\n${info.siteUrl}`)
            }
        } catch (error) {
            await safeSendMessage(handler, channelId, 'AniList is not responding right now. Please try again later.')
            console.error('AniList error:', error)
        }
    })

    bot.onSlashCommand('recommend', async (handler, event) => {
        const { channelId, args } = event
        console.log(`[SLASH] /recommend args="${(args || []).join(' ')}"`)
        const vibe = (args || []).join(' ').trim() || 'action'
        try {
            const recs = await getRecommendations(vibe)
            if (recs.length === 0) {
                await safeSendMessage(handler, channelId, `No anime found for "${vibe}". Try a different genre.`)
        return
    }
            let msg = `🎯 Top ${recs.length} "${vibe}" anime\n\n`
            for (const rec of recs) {
                msg += `• ${rec.title} — eps: ${rec.episodes ?? '?'} — score: ${rec.score ?? '?'}\n${rec.siteUrl}\n\n`
            }
            await safeSendMessage(handler, channelId, msg.trim())
        } catch (error) {
            await safeSendMessage(handler, channelId, 'AniList is not responding right now. Please try again later.')
            console.error('AniList error:', error)
        }
    })

    bot.onSlashCommand('quote', async (handler, event) => {
        const { channelId, args } = event
        console.log(`[SLASH] /quote args="${(args || []).join(' ')}"`)
        const quote = ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)]
        await safeSendMessage(handler, channelId, `💬 "${quote.quote}" — ${quote.character}`)
    })

    // Main handler for guess_anime (snake_case)
    const guessAnimeHandler = async (handler: any, { channelId, userId, spaceId, args }: any) => {
        const isAdmin = await handler.hasAdminPermission(userId, spaceId)
        if (!isAdmin) {
            await safeSendMessage(handler, channelId, '❌ Admin only.')
        return
    }
        if (activeTriviaGames.has(channelId)) {
            await safeSendMessage(handler, channelId, '❌ Game already active. Wait for it to finish.')
        return
    }
        const question = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)]
        await safeSendMessage(handler, channelId, `**🎮 Guess the Anime**\n\n${question.clue}\n\n*60 seconds to answer!*`)
        const timeoutId = setTimeout(async () => {
            const game = activeTriviaGames.get(channelId)
            activeTriviaGames.delete(channelId)
            if (game && !game.hasWinner && bot) {
                try {
                    await bot.sendMessage(channelId, `⏰ Time's up! Answer: **${question.answer}**`)
                    const preview = truncateText(`⏰ Time's up! Answer: **${question.answer}**`)
                    console.log(`[REPLY] to channel=${channelId} text="${preview}"`)
                } catch (error) {
                    const code = (error as any)?.code || 'unknown'
                    const msg = error instanceof Error ? error.message : String(error)
                    console.error(`[SEND-ERROR] code=${code} message="${msg}"`)
                }
            }
        }, 60000)
        activeTriviaGames.set(channelId, {
            answer: question.answer,
            clue: question.clue,
            hasWinner: false,
            timeoutId,
        })
    }

    bot.onSlashCommand('guess_anime', async (handler, event) => {
        console.log(`[SLASH] /guess_anime args="${(event.args || []).join(' ')}"`)
        await guessAnimeHandler(handler, event)
    })

    // Backward compatibility: deprecated guess-anime alias
    bot.onSlashCommand('guess-anime', async (handler, event) => {
        console.log(`[SLASH] deprecated alias guess-anime -> guess_anime`)
        console.log(`[SLASH] /guess_anime args="${(event.args || []).join(' ')}"`)
        await guessAnimeHandler(handler, event)
    })

    bot.onSlashCommand('news', async (handler, event) => {
        const { channelId, args } = event
        console.log(`[SLASH] /news args="${(args || []).join(' ')}"`)
        await safeSendMessage(handler, channelId, '📰 Anime news (coming soon).')
    })

    bot.onSlashCommand('calendar', async (handler, event) => {
        const { channelId, args } = event
        console.log(`[SLASH] /calendar args="${(args || []).join(' ')}"`)
        await safeSendMessage(handler, channelId, '🗓️ Weekly airing calendar (coming soon).')
    })

    bot.onSlashCommand('ban', async (handler, event) => {
        const { channelId, userId, spaceId, mentions, args } = event
        console.log(`[SLASH] /ban args="${(args || []).join(' ')}"`)
        const isAdmin = await handler.hasAdminPermission(userId, spaceId)
        if (!isAdmin) {
            await safeSendMessage(handler, channelId, '❌ Admin only.')
            return
        }
        const userToBan = mentions[0]?.userId || (args || [])[0]
        if (!userToBan || !userToBan.startsWith('0x') || userToBan.length !== 42) {
            await safeSendMessage(handler, channelId, '❌ Usage: `/ban @user` or `/ban <userId>`')
            return
        }
        try {
            await handler.ban(userToBan, spaceId)
            console.log(`[${new Date().toISOString()}] 🔨 Banned ${userToBan} by ${userId}`)
            await safeSendMessage(handler, channelId, `✅ Banned <@${userToBan}>`)
        } catch (error) {
            await safeSendMessage(handler, channelId, `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    })

    bot.onSlashCommand('mute', async (handler, event) => {
        const { channelId, userId, spaceId, mentions, args } = event
        console.log(`[SLASH] /mute args="${(args || []).join(' ')}"`)
        const isAdmin = await handler.hasAdminPermission(userId, spaceId)
        if (!isAdmin) {
            await safeSendMessage(handler, channelId, '❌ Admin only.')
            return
        }
        const userToMute = mentions[0]?.userId || (args || [])[0]
        if (!userToMute) {
            await safeSendMessage(handler, channelId, '❌ Usage: `/mute @user`')
            return
        }
        console.log(`[${new Date().toISOString()}] 🔇 Muted ${userToMute} by ${userId}`)
        await safeSendMessage(handler, channelId, `🔇 Muted <@${userToMute}>\nNote: Actual muting coming soon.`)
    })

    bot.onSlashCommand('purge', async (handler, event) => {
        const { channelId, userId, spaceId, args } = event
        console.log(`[SLASH] /purge args="${(args || []).join(' ')}"`)
        const isAdmin = await handler.hasAdminPermission(userId, spaceId)
        if (!isAdmin) {
            await safeSendMessage(handler, channelId, '❌ Admin only.')
            return
        }
        const count = parseInt((args || [])[0])
        if (isNaN(count) || count < 1 || count > 100) {
            await safeSendMessage(handler, channelId, '❌ Usage: `/purge 25` (1-100)')
            return
        }
        console.log(`[${new Date().toISOString()}] 🗑️ Purge ${count} messages by ${userId}`)
        await safeSendMessage(handler, channelId, `🗑️ Purge ${count} messages...\nNote: Implementation coming soon.`)
    })
}

// ============================================================================
// BOT INITIALIZATION
// ============================================================================

// Log command names before registration
const commandNames = commands.map(c => c.name).join(', ')
console.log(`[START] registering slash commands: ${commandNames}`)

makeTownsBot(process.env.APP_PRIVATE_DATA!, process.env.JWT_SECRET!, { commands })
    .then((initializedBot) => {
        bot = initializedBot
        const webhook = bot.start()
        jwtMiddleware = webhook.jwtMiddleware
        webhookHandler = webhook.handler
        
        // Initialize Hono webhook app ONCE (not per-request)
        webhookApp = new Hono()
        // Register both /webhook and /webhook/ to handle trailing slash
        webhookApp.post('/webhook', jwtMiddleware, webhookHandler)
        webhookApp.post('/webhook/', jwtMiddleware, webhookHandler)
        
        setupBotHandlers(bot)
        console.log('[START] registered OK')
        console.log('✅ Bot initialized successfully')
    })
    .catch((error) => {
        // Check for command name validation errors
        const errorMsg = error instanceof Error ? error.message : String(error)
        const invalidCommandMatch = errorMsg.match(/command.*?["']([^"']+)["']/i)
        
        if (invalidCommandMatch) {
            const offendingName = invalidCommandMatch[1]
            console.error(`[START] command registration failed: invalid name "${offendingName}"`)
            console.error(`[START] error: ${errorMsg}`)
        }
        
        // Suppress ConnectError - it's non-fatal
        const isConnectError = error instanceof Error && 
            (error.message?.includes('Connect') || 
             error.constructor?.name === 'ConnectError' ||
             error.stack?.includes('connect-error'))
        
        if (isConnectError) {
            console.warn('⚠️ Connection warning (non-fatal, bot may still work)')
        } else if (!invalidCommandMatch) {
            console.error('⚠️ Bot initialization error:', errorMsg)
        }
        
        // Do NOT crash - keep server running so webhook still works
        console.log('[START] continuing despite registration error (webhook may still work)')
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
                if (process.env.FRANKY_DEBUG === 'true') {
                    console.log('[WEBHOOK] 200 handled (initializing)')
                }
                return new Response('OK: initializing', { status: 200 })
            }

            // Call pre-initialized Hono webhook app (don't pre-read req.body)
            try {
                const res = await webhookApp.fetch(req)
                
                // Ensure we return a Response object
                if (!(res instanceof Response)) {
                    console.log('[WEBHOOK] 200 (wrapped non-Response)')
                    if (process.env.FRANKY_DEBUG === 'true') {
                        console.log('[WEBHOOK] 200 handled (non-Response wrapped)')
                    }
                    return new Response('OK', { status: 200 })
                }
                
                // Check SDK response status
                const status = res.status || 200
                console.log(`[WEBHOOK] ${status}`)
                
                // Towns requires HTTP 200 OK - return SDK response if 200, otherwise normalize to 200
                if (status === 200) {
                    // Debug logging if enabled
                    if (process.env.FRANKY_DEBUG === 'true') {
                        console.log('[WEBHOOK] 200 handled')
                    }
                    return res
                }
                
                // SDK returned non-200 - log warning and return 200 OK (Towns requirement)
                console.warn(`[WEBHOOK] Warning: SDK returned ${status}, normalizing to 200 OK`)
                if (process.env.FRANKY_DEBUG === 'true') {
                    console.log('[WEBHOOK] 200 handled (normalized)')
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
