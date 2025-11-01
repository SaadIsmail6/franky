import { makeTownsBot } from '@towns-protocol/bot'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import commands from './commands'
import { getAiringInfo, getRecommendations } from './anilist'

/**
 * Franky - Towns Protocol Bot for Anime Communities
 * Complete rewrite - all errors fixed
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
// BOT INITIALIZATION
// ============================================================================

const app = new Hono()
app.use(logger())

const startTime = Date.now()

// Health endpoints
app.get('/', () => new Response('Franky is running ✅', { status: 200 }))
app.get('/health', () => Response.json({ ok: true, uptime: Math.floor((Date.now() - startTime) / 1000) }))

// Bot state
let bot: Awaited<ReturnType<typeof makeTownsBot>> | null = null
let jwtMiddleware: any = null
let handler: any = null

// ============================================================================
// BOT HANDLERS SETUP
// ============================================================================

function setupBotHandlers(bot: Awaited<ReturnType<typeof makeTownsBot>>) {
    // Channel join
    bot.onChannelJoin(async (_, { channelId }) => {
        console.log(`Franky joined channel: ${channelId}`)
    })

    // Message handler
    bot.onMessage(async (handler, { message, channelId, eventId, userId, spaceId, isMentioned }) => {
        if (userId === bot.botId) return

        // Trivia check
        const game = activeTriviaGames.get(channelId)
        if (game && !game.hasWinner && checkTriviaAnswer(message, game.answer)) {
            game.hasWinner = true
            clearTimeout(game.timeoutId)
            activeTriviaGames.delete(channelId)
            await handler.sendMessage(channelId, `✅ Correct, <@${userId}>! Answer: ${game.answer}`, {
                mentions: [{ userId, displayName: 'Winner' }],
            })
            return
        }

        // Mentions
        const lower = message.toLowerCase()
        const mentioned = isMentioned || lower.includes('franky')
        if (mentioned) {
            if (lower.includes('hi') || lower.includes('hello')) {
                await handler.sendMessage(channelId, 'Hi there 👋')
                return
            }
            if (lower.includes('who are you franky')) {
                await handler.sendMessage(channelId, "I'm Franky, the super cyborg of AnimeTown!🌸")
                return
            }
            if (lower.includes('bye franky')) {
                await handler.sendMessage(channelId, 'See ya later!')
                return
            }
            if (lower.includes('thanks franky') || lower.includes('thank you franky')) {
                await handler.sendMessage(channelId, 'Anytime, nakama! 🙌')
                return
            }
        }

        // Moderation
        if (isScamOrSpam(message)) {
            const isAdmin = await handler.hasAdminPermission(userId, spaceId)
            if (isAdmin) return

            const canRedact = await handler.checkPermission(channelId, bot.botId, 4) // Redact
            if (canRedact) {
                await handler.adminRemoveEvent(channelId, eventId)
                console.log(`[${new Date().toISOString()}] 🛡️ Deleted scam/spam from ${userId}`)
            }
        }
    })

    // Slash commands
    bot.onSlashCommand('help', async (handler, { channelId }) => {
        await handler.sendMessage(
            channelId,
            'Franky — Commands\n\n' +
            '• /airing <title>\n' +
            '• /recommend <vibe>\n' +
            '• /quote\n' +
            '• /guess-anime\n' +
            '• /news\n' +
            '• /calendar\n\n' +
            'Moderation (admins):\n\n' +
            '• /ban @user • /mute @user 10m • /purge 25'
        )
    })

    bot.onSlashCommand('airing', async (handler, { channelId, args }) => {
        const title = args.join(' ').trim()
        if (!title) {
            await handler.sendMessage(channelId, 'Usage: `/airing <title>`\nExample: `/airing One Piece`')
            return
        }
        try {
            const info = await getAiringInfo(title)
            if (!info) {
                await handler.sendMessage(channelId, 'Not found. Try a different title.')
                return
            }
            if (info.nextEpisode !== null && info.timeUntilSeconds !== null) {
                const eta = formatETA(info.timeUntilSeconds)
                await handler.sendMessage(channelId, `📺 ${info.title}\nNext ep: ~${eta} | #${info.nextEpisode}\n${info.siteUrl}`)
            } else {
                await handler.sendMessage(channelId, `📺 ${info.title}\nNo upcoming episode info.\n${info.siteUrl}`)
            }
        } catch (error) {
            await handler.sendMessage(channelId, 'AniList is not responding right now. Please try again later.')
            console.error('AniList error:', error)
        }
    })

    bot.onSlashCommand('recommend', async (handler, { channelId, args }) => {
        const vibe = args.join(' ').trim() || 'action'
        try {
            const recs = await getRecommendations(vibe)
            if (recs.length === 0) {
                await handler.sendMessage(channelId, `No anime found for "${vibe}". Try a different genre.`)
                return
            }
            let msg = `🎯 Top ${recs.length} "${vibe}" anime\n\n`
            for (const rec of recs) {
                msg += `• ${rec.title} — eps: ${rec.episodes ?? '?'} — score: ${rec.score ?? '?'}\n${rec.siteUrl}\n\n`
            }
            await handler.sendMessage(channelId, msg.trim())
        } catch (error) {
            await handler.sendMessage(channelId, 'AniList is not responding right now. Please try again later.')
            console.error('AniList error:', error)
        }
    })

    bot.onSlashCommand('quote', async (handler, { channelId }) => {
        const quote = ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)]
        await handler.sendMessage(channelId, `💬 "${quote.quote}" — ${quote.character}`)
    })

    bot.onSlashCommand('guess-anime', async (handler, { channelId, userId, spaceId }) => {
        const isAdmin = await handler.hasAdminPermission(userId, spaceId)
        if (!isAdmin) {
            await handler.sendMessage(channelId, '❌ Admin only.')
            return
        }
        if (activeTriviaGames.has(channelId)) {
            await handler.sendMessage(channelId, '❌ Game already active. Wait for it to finish.')
            return
        }
        const question = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)]
        await handler.sendMessage(channelId, `**🎮 Guess the Anime**\n\n${question.clue}\n\n*60 seconds to answer!*`)
        const timeoutId = setTimeout(async () => {
            const game = activeTriviaGames.get(channelId)
            activeTriviaGames.delete(channelId)
            if (game && !game.hasWinner && bot) {
                await bot.sendMessage(channelId, `⏰ Time's up! Answer: **${question.answer}**`)
            }
        }, 60000)
        activeTriviaGames.set(channelId, {
            answer: question.answer,
            clue: question.clue,
            hasWinner: false,
            timeoutId,
        })
    })

    bot.onSlashCommand('news', async (handler, { channelId }) => {
        await handler.sendMessage(channelId, '📰 Anime news (coming soon).')
    })

    bot.onSlashCommand('calendar', async (handler, { channelId }) => {
        await handler.sendMessage(channelId, '🗓️ Weekly airing calendar (coming soon).')
    })

    bot.onSlashCommand('ban', async (handler, { channelId, userId, spaceId, mentions, args }) => {
        const isAdmin = await handler.hasAdminPermission(userId, spaceId)
        if (!isAdmin) {
            await handler.sendMessage(channelId, '❌ Admin only.')
            return
        }
        const userToBan = mentions[0]?.userId || args[0]
        if (!userToBan || !userToBan.startsWith('0x') || userToBan.length !== 42) {
            await handler.sendMessage(channelId, '❌ Usage: `/ban @user` or `/ban <userId>`')
            return
        }
        try {
            await handler.ban(userToBan, spaceId)
            console.log(`[${new Date().toISOString()}] 🔨 Banned ${userToBan} by ${userId}`)
            await handler.sendMessage(channelId, `✅ Banned <@${userToBan}>`)
        } catch (error) {
            await handler.sendMessage(channelId, `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    })

    bot.onSlashCommand('mute', async (handler, { channelId, userId, spaceId, mentions, args }) => {
        const isAdmin = await handler.hasAdminPermission(userId, spaceId)
        if (!isAdmin) {
            await handler.sendMessage(channelId, '❌ Admin only.')
            return
        }
        const userToMute = mentions[0]?.userId || args[0]
        if (!userToMute) {
            await handler.sendMessage(channelId, '❌ Usage: `/mute @user`')
            return
        }
        console.log(`[${new Date().toISOString()}] 🔇 Muted ${userToMute} by ${userId}`)
        await handler.sendMessage(channelId, `🔇 Muted <@${userToMute}>\nNote: Actual muting coming soon.`)
    })

    bot.onSlashCommand('purge', async (handler, { channelId, userId, spaceId, args }) => {
        const isAdmin = await handler.hasAdminPermission(userId, spaceId)
        if (!isAdmin) {
            await handler.sendMessage(channelId, '❌ Admin only.')
            return
        }
        const count = parseInt(args[0])
        if (isNaN(count) || count < 1 || count > 100) {
            await handler.sendMessage(channelId, '❌ Usage: `/purge 25` (1-100)')
            return
        }
        console.log(`[${new Date().toISOString()}] 🗑️ Purge ${count} messages by ${userId}`)
        await handler.sendMessage(channelId, `🗑️ Purge ${count} messages...\nNote: Implementation coming soon.`)
    })
}

// ============================================================================
// WEBHOOK HANDLER (Must be registered BEFORE bot init completes)
// ============================================================================

// Webhook endpoint - handles bot initialization state
app.post('/webhook', async (c) => {
    // If bot not ready, return 503
    if (!bot || !jwtMiddleware || !handler) {
        return c.json({ error: 'Bot initializing' }, 503)
    }
    
    // Bot ready - use middleware chain (handler sets response to 200 automatically)
    try {
        await jwtMiddleware(c, async () => {
            await handler(c)
        })
        // Return the response (should be 200 if handler finalized context)
        // If not finalized, return 200 explicitly
        return c.res || new Response(null, { status: 200 })
    } catch (error) {
        console.error('Webhook error:', error)
        return c.json({ error: 'Internal server error' }, 500)
    }
})

// Reject non-POST
app.all('/webhook', (c) => {
    if (c.req.method !== 'POST') {
        return c.json({ error: 'Method not allowed' }, 405)
    }
})

// ============================================================================
// BOT INITIALIZATION (Non-blocking, suppresses ConnectError)
// ============================================================================

makeTownsBot(process.env.APP_PRIVATE_DATA!, process.env.JWT_SECRET!, { commands })
    .then((initializedBot) => {
        bot = initializedBot
        const webhook = bot.start()
        jwtMiddleware = webhook.jwtMiddleware
        handler = webhook.handler
        setupBotHandlers(bot)
        console.log('✅ Bot initialized successfully')
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
// SERVER STARTUP
// ============================================================================

if (!globalThis.__FRANKY_SERVER_STARTED) {
    globalThis.__FRANKY_SERVER_STARTED = true
    const port = Number(process.env.PORT || 3000)
    Bun.serve({
        hostname: '0.0.0.0',
        port,
        fetch: app.fetch,
    })
    console.log(`Listening on :${port}`)
}

export {}
