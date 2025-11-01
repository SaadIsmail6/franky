import { makeTownsBot } from '@towns-protocol/bot'
import { Permission } from '@towns-protocol/sdk'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import commands from './commands'
import { getAiringInfo, getRecommendations } from './anilist'

/**
 * Franky - A Towns Protocol bot for anime communities
 */

/**
 * Convert seconds to a friendly ETA string (e.g., "~42h" or "1d 18h")
 */
function formatETA(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) {
        if (hours > 0) {
            return `${days}d ${hours}h`
        }
        return `${days}d`
    }

    if (hours > 0) {
        return `~${hours}h`
    }

    if (minutes > 0) {
        return `~${minutes}m`
    }

    return 'soon'
}

// Initialize the bot with credentials from environment variables
const bot = await makeTownsBot(process.env.APP_PRIVATE_DATA!, process.env.JWT_SECRET!, {
    commands,
})

/**
 * Set bot name when joining channels
 */
bot.onChannelJoin(async (handler, { channelId }) => {
    // Note: Bot name/display name setting would happen here if API supports it
    // Currently Towns bots derive their identity from the app credentials
    console.log(`Franky joined channel: ${channelId}`)
})

/**
 * Scam/Spam detection keywords and patterns
 */
const SCAM_KEYWORDS = [
    // Discord Nitro scams
    'free nitro',
    'nitro giveaway',
    'discord nitro',
    'claim nitro',
    'nitro reward',
    
    // Airdrop scams
    'claim airdrop',
    'free airdrop',
    'airdrop reward',
    'claim your airdrop',
    
    // Seed phrase scams
    'seed phrase',
    'private key',
    'mnemonic',
    'wallet seed',
    'recover wallet',
    
    // General scam patterns
    'claim reward',
    'claim your reward',
    'free money',
    'crypto giveaway',
    'click here to claim',
    'verify your wallet',
    'connect wallet to claim',
]

/**
 * Check if a message contains scam/spam content
 */
function isScamOrSpam(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    return SCAM_KEYWORDS.some(keyword => lowerMessage.includes(keyword.toLowerCase()))
}

/**
 * Check if message contains the correct trivia answer (case-insensitive)
 */
function checkTriviaAnswer(message: string, answer: string): boolean {
    const lowerMessage = message.toLowerCase().trim()
    const lowerAnswer = answer.toLowerCase().trim()
    return lowerMessage.includes(lowerAnswer)
}

/**
 * Check if message mentions Franky (case-insensitive)
 */
function mentionsFranky(message: string, isMentioned: boolean): boolean {
    const lowerMessage = message.toLowerCase()
    return isMentioned || lowerMessage.includes('franky')
}

/**
 * Moderation: Auto-delete scam/spam messages
 * Also handles trivia game answers and Franky mentions
 */
bot.onMessage(async (handler, { message, channelId, eventId, userId, spaceId, isMentioned }) => {
    // Skip checking bot's own messages
    if (userId === bot.botId) {
        return
    }

    // Check for active trivia game in this channel
    const triviaGame = activeTriviaGames.get(channelId)
    if (triviaGame && !triviaGame.hasWinner) {
        // Check if message contains the correct answer
        if (checkTriviaAnswer(message, triviaGame.answer)) {
            // Mark as won and clean up
            triviaGame.hasWinner = true
            clearTimeout(triviaGame.timeoutId)
            activeTriviaGames.delete(channelId)

            // Announce winner
            await handler.sendMessage(
                channelId,
                `✅ Correct, <@${userId}>! Answer: ${triviaGame.answer}`,
                {
                    mentions: [{ userId, displayName: 'Winner' }],
                },
            )
            return // Don't process moderation for winning messages
        }
    }

    // Check if Franky is mentioned (case-insensitive)
    const lowerMessage = message.toLowerCase()
    if (mentionsFranky(message, isMentioned)) {
        // Handle greeting patterns
        if (lowerMessage.includes('hi franky') || lowerMessage.includes('hello franky')) {
            await handler.sendMessage(channelId, 'Hi there 👋')
            return
        }

        // Handle introduction question
        if (lowerMessage.includes('who are you franky')) {
            await handler.sendMessage(
                channelId,
                "I'm Franky, the super cyborg of AnimeTown!🌸",
            )
            return
        }

        // Handle goodbye patterns
        if (lowerMessage.includes('bye franky')) {
            await handler.sendMessage(channelId, 'See ya later!')
            return
        }

        // Handle thank you patterns
        if (lowerMessage.includes('thanks franky') || lowerMessage.includes('thank you franky')) {
            await handler.sendMessage(channelId, 'Anytime, nakama! 🙌')
            return
        }
    }

    // Check for scam/spam content
    if (isScamOrSpam(message)) {
        // Ignore messages from admins
        const isAdmin = await handler.hasAdminPermission(userId, spaceId)
        if (isAdmin) {
            return
        }

        // Check if bot has redaction permission
        const canRedact = await handler.checkPermission(
            channelId,
            bot.botId,
            Permission.Redact
        )

        if (canRedact) {
            // Delete the scam/spam message
            await handler.adminRemoveEvent(channelId, eventId)
            
            // Log moderation action with timestamp
            const timestamp = new Date().toISOString()
            console.log(`[${timestamp}] 🛡️ Moderation: Deleted scam/spam message from ${userId} in channel ${channelId}`)
            
            // Optionally send a warning (be careful not to spam)
            // await handler.sendMessage(
            //     channelId,
            //     `⚠️ Removed suspicious message from <@${userId}>`
            // )
        } else {
            const timestamp = new Date().toISOString()
            console.warn(`[${timestamp}] ⚠️ Cannot delete scam message - bot lacks Redact permission`)
        }
    }
})

/**
 * /help - Show available commands
 */
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
            '• /ban @user • /mute @user 10m • /purge 25',
    )
})

/**
 * /airing - Check currently airing anime
 */
bot.onSlashCommand('airing', async (handler, { channelId, args }) => {
    // Read anime title from args
    const title = args.join(' ').trim()
    
    if (!title) {
        await handler.sendMessage(
            channelId,
            'Usage: `/airing <anime title>`\n' +
            'Example: `/airing One Piece`',
        )
        return
    }

    try {
        // Call AniList API
        const airingInfo = await getAiringInfo(title)

        // Handle not found case
        if (!airingInfo) {
            await handler.sendMessage(
                channelId,
                'Not found. Try a different title.',
            )
            return
        }

        // Format response based on whether next episode info exists
        if (airingInfo.nextEpisode !== null && airingInfo.timeUntilSeconds !== null) {
            const eta = formatETA(airingInfo.timeUntilSeconds)
            
            await handler.sendMessage(
                channelId,
                `📺 ${airingInfo.title}\n` +
                `Next ep: ~${eta} | #${airingInfo.nextEpisode}\n` +
                airingInfo.siteUrl,
            )
        } else {
            await handler.sendMessage(
                channelId,
                `📺 ${airingInfo.title}\n` +
                `No upcoming episode info.\n` +
                airingInfo.siteUrl,
            )
        }
    } catch (error) {
        // Handle API errors
        await handler.sendMessage(
            channelId,
            'AniList is not responding right now. Please try again later.',
        )
        console.error('AniList API error:', error)
    }
})

/**
 * /recommend - Get anime recommendations
 */
bot.onSlashCommand('recommend', async (handler, { channelId, args }) => {
    // Get vibe from args, default to "action"
    const vibe = args.join(' ').trim() || 'action'

    try {
        // Get recommendations from AniList
        const recommendations = await getRecommendations(vibe)

        // Handle empty results
        if (recommendations.length === 0) {
            await handler.sendMessage(
                channelId,
                `No anime found for vibe "${vibe}". Try a different genre (e.g., action, romance, comedy).`,
            )
            return
        }

        // Format recommendations
        let message = `🎯 Top ${recommendations.length} "${vibe}" anime\n\n`

        recommendations.forEach((rec) => {
            // Format episode count
            const episodesText = rec.episodes !== null ? rec.episodes.toString() : '?'

            // Format score (averageScore is 0-100)
            const scoreText = rec.score !== null ? rec.score.toString() : '?'

            message += `• ${rec.title} — eps: ${episodesText} — score: ${scoreText}\n`
            message += `${rec.siteUrl}\n\n`
        })

        await handler.sendMessage(channelId, message.trim())
    } catch (error) {
        // Handle API errors
        await handler.sendMessage(
            channelId,
            'AniList is not responding right now. Please try again later.',
        )
        console.error('AniList API error:', error)
    }
})

/**
 * Trivia game storage: tracks active games per channel
 * Format: channelId -> { answer: string, clue: string, hasWinner: boolean, timeoutId: NodeJS.Timeout }
 */
const activeTriviaGames = new Map<string, {
    answer: string
    clue: string
    hasWinner: boolean
    timeoutId: NodeJS.Timeout
}>()

/**
 * Anime trivia clue/answer pairs
 */
const TRIVIA_QUESTIONS = [
    {
        clue: 'What anime features a young ninja with a nine-tailed fox sealed inside him?',
        answer: 'Naruto',
    },
    {
        clue: 'In which anime do humans fight giant humanoid creatures called Titans behind three massive walls?',
        answer: 'Attack on Titan',
    },
    {
        clue: 'What anime follows Izuku Midoriya as he trains to become the world\'s greatest hero?',
        answer: 'My Hero Academia',
    },
    {
        clue: 'Which anime features a boy who can turn into a Titan and fights to protect humanity?',
        answer: 'Attack on Titan',
    },
    {
        clue: 'What shonen anime follows a team of ninjas from the Hidden Leaf Village?',
        answer: 'Naruto',
    },
]

/**
 * Collection of safe anime quotes
 */
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

/**
 * /quote - Get a random anime quote
 */
bot.onSlashCommand('quote', async (handler, { channelId }) => {
    // Select a random quote
    const randomQuote = ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)]
    
    await handler.sendMessage(
        channelId,
        `💬 "${randomQuote.quote}" — ${randomQuote.character}`,
    )
})

/**
 * /guess-anime - Play guess the anime game (admin only)
 */
bot.onSlashCommand('guess-anime', async (handler, { channelId, userId, spaceId }) => {
    // Check admin permission
    const isAdmin = await handler.hasAdminPermission(userId, spaceId)
    
    if (!isAdmin) {
        await handler.sendMessage(
            channelId,
            '❌ This command is admin-only. You don\'t have permission to use it.',
        )
        return
    }

    // Check if there's already an active game in this channel
    const existingGame = activeTriviaGames.get(channelId)
    if (existingGame) {
        await handler.sendMessage(
            channelId,
            '❌ There is already an active trivia game in this channel. Wait for it to finish.',
        )
        return
    }

    // Select a random trivia question
    const randomQuestion = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)]

    // Post the clue
    await handler.sendMessage(
        channelId,
        `**🎮 Guess the Anime**\n\n${randomQuestion.clue}\n\n*You have 60 seconds to answer!*`,
    )

    // Set up the game
    const timeoutId = setTimeout(async () => {
        // Get the game state before cleaning up
        const game = activeTriviaGames.get(channelId)
        
        // Remove the game from active games
        activeTriviaGames.delete(channelId)

        // Only send timeout message if no one won
        if (game && !game.hasWinner) {
            await bot.sendMessage(
                channelId,
                `⏰ Time's up! The answer was: **${randomQuestion.answer}**`,
            )
        }
    }, 60000) // 60 seconds

    // Store the active game
    activeTriviaGames.set(channelId, {
        answer: randomQuestion.answer,
        clue: randomQuestion.clue,
        hasWinner: false,
        timeoutId,
    })
})

/**
 * /news - Get the latest anime news
 * 
 * TODO: Hook up RSS feeds to fetch real-time anime news
 * TODO: Set up Sunday 7 AM cron job to post weekly news summary
 */
bot.onSlashCommand('news', async (handler, { channelId }) => {
    await handler.sendMessage(
        channelId,
        '📰 Anime news (coming soon).',
    )
})

/**
 * /calendar - View anime release calendar
 * 
 * TODO: Hook up RSS feeds to fetch anime airing schedules
 * TODO: Set up Sunday 7 AM cron job to post weekly airing calendar
 */
bot.onSlashCommand('calendar', async (handler, { channelId }) => {
    await handler.sendMessage(
        channelId,
        '🗓️ Weekly airing calendar (coming soon).',
    )
})

/**
 * /ban - Ban a user from the space (admin only)
 */
bot.onSlashCommand('ban', async (handler, { channelId, userId, spaceId, mentions, args }) => {
    // Check admin permission
    const isAdmin = await handler.hasAdminPermission(userId, spaceId)
    
    if (!isAdmin) {
        await handler.sendMessage(
            channelId,
            '❌ This command is admin-only. You don\'t have permission to ban users.',
        )
        return
    }

    // Get user to ban (from mentions or args)
    const userToBan = mentions[0]?.userId || args[0]
    
    if (!userToBan) {
        await handler.sendMessage(
            channelId,
            '❌ Please mention a user or provide a user ID.\n' +
            'Usage: `/ban @user` or `/ban <userId>`',
        )
        return
    }

    // Validate user ID format (should be hex address)
    if (!userToBan.startsWith('0x') || userToBan.length !== 42) {
        await handler.sendMessage(
            channelId,
            '❌ Invalid user ID format. Please mention the user or provide a valid address.',
        )
        return
    }

    try {
        // Attempt to ban the user (bot must have ModifyBanning permission)
        await handler.ban(userToBan, spaceId)
        
        const displayName = mentions[0]?.displayName || userToBan
        const timestamp = new Date().toISOString()
        console.log(`[${timestamp}] 🔨 Moderation: User ${userToBan} (${displayName}) banned from space ${spaceId} by ${userId}`)
        
        await handler.sendMessage(
            channelId,
            `✅ Successfully banned <@${userToBan}> (${displayName}) from the space.`,
        )
    } catch (error) {
        const timestamp = new Date().toISOString()
        console.error(`[${timestamp}] ❌ Ban error:`, error)
        await handler.sendMessage(
            channelId,
            `❌ Failed to ban user: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
            `Make sure the bot has ModifyBanning permission.`,
        )
    }
})

/**
 * /mute - Mute a user in the channel (admin only)
 * Note: Actual muting functionality depends on Towns API capabilities
 */
bot.onSlashCommand('mute', async (handler, { channelId, userId, spaceId, mentions, args }) => {
    // Check admin permission
    const isAdmin = await handler.hasAdminPermission(userId, spaceId)
    
    if (!isAdmin) {
        await handler.sendMessage(
            channelId,
            '❌ This command is admin-only. You don\'t have permission to mute users.',
        )
        return
    }

    // Get user to mute (from mentions or args)
    const userToMute = mentions[0]?.userId || args[0]
    
    if (!userToMute) {
        await handler.sendMessage(
            channelId,
            '❌ Please mention a user or provide a user ID.\n' +
            'Usage: `/mute @user` or `/mute @user 10m`',
        )
        return
    }

    // TODO: Implement actual muting when Towns API supports it
    // For now, just acknowledge the command
    const displayName = mentions[0]?.displayName || userToMute
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] 🔇 Moderation: User ${userToMute} (${displayName}) muted in channel ${channelId} by ${userId}`)
    
    await handler.sendMessage(
        channelId,
        `🔇 Muted <@${userToMute}> (${displayName}) in this channel.\n` +
        `Note: Actual muting functionality coming soon.`,
    )
})

/**
 * /purge - Delete multiple messages (admin only)
 */
bot.onSlashCommand('purge', async (handler, { channelId, userId, spaceId, args, replyId }) => {
    // Check admin permission
    const isAdmin = await handler.hasAdminPermission(userId, spaceId)
    
    if (!isAdmin) {
        await handler.sendMessage(
            channelId,
            '❌ This command is admin-only. You don\'t have permission to purge messages.',
        )
        return
    }

    // Get number of messages to delete
    if (!args[0]) {
        await handler.sendMessage(
            channelId,
            '❌ Please specify how many messages to delete.\n' +
            'Usage: `/purge 25` (between 1 and 100)',
        )
        return
    }

    const count = parseInt(args[0])
    
    if (isNaN(count) || count < 1 || count > 100) {
        await handler.sendMessage(
            channelId,
            '❌ Please specify a valid number between 1 and 100.\n' +
            'Usage: `/purge 25`',
        )
        return
    }

    // Check if bot has redaction permission
    const canRedact = await handler.checkPermission(
        channelId,
        bot.botId,
        Permission.Redact
    )

    if (!canRedact) {
        await handler.sendMessage(
            channelId,
            '❌ Bot does not have permission to delete messages. (Requires Redact permission)',
        )
        return
    }

    // TODO: Implement actual message purging
    // Note: Towns bot framework doesn't provide a direct way to fetch recent messages
    // This would require implementing message history tracking or using a different approach
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] 🗑️ Moderation: Purge command executed - attempting to delete ${count} messages in channel ${channelId} by ${userId}`)
    
    await handler.sendMessage(
        channelId,
        `🗑️ Purge command received. Deleting ${count} messages...\n` +
        `Note: Message purging requires tracking message history. Implementation coming soon.`,
    )
})

/**
 * Start the bot and create webhook handler
 */
const { jwtMiddleware, handler } = bot.start()

/**
 * Initialize Hono server
 */
const app = new Hono()
app.use(logger())
app.post('/webhook', jwtMiddleware, handler)

export default app
