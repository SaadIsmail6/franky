import type { Bot, BotHandler } from '@towns-protocol/bot'
import { getAiringInfo, getRecommendations } from './anilist'

type Mention = {
    userId: string
    displayName: string
}

export interface SlashCommandEventPayload {
    channelId: string
    userId: string
    spaceId: string
    eventId: string
    command: string
    args: string[]
    mentions: Mention[]
    replyId?: string
    threadId?: string
}

export type SendMessageOptions = Parameters<BotHandler['sendMessage']>[2]

export type SafeSendMessage = (
    handler: BotHandler,
    channelId: string,
    message: string,
    opts?: SendMessageOptions
) => Promise<void>

export interface CommandExecuteContext {
    handler: BotHandler
    event: SlashCommandEventPayload
    safeSendMessage: SafeSendMessage
    bot: Bot<any, any> | null
    startTime: number
}

export interface CommandDefinition {
    name: string
    description: string
    execute: (ctx: CommandExecuteContext) => Promise<void>
}

export const activeTriviaGames = new Map<
    string,
    {
        answer: string
        clue: string
        hasWinner: boolean
        timeoutId: NodeJS.Timeout
    }
>()

export const TRIVIA_QUESTIONS = [
    { clue: 'What anime features a young ninja with a nine-tailed fox sealed inside him?', answer: 'Naruto' },
    { clue: 'In which anime do humans fight giant humanoid creatures called Titans behind three massive walls?', answer: 'Attack on Titan' },
    { clue: 'What anime follows Izuku Midoriya as he trains to become the world\'s greatest hero?', answer: 'My Hero Academia' },
    { clue: 'Which anime features a boy who can turn into a Titan and fights to protect humanity?', answer: 'Attack on Titan' },
    { clue: 'What shonen anime follows a team of ninjas from the Hidden Leaf Village?', answer: 'Naruto' },
]

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

export function checkTriviaAnswer(message: string, answer: string): boolean {
    return message.toLowerCase().trim().includes(answer.toLowerCase().trim())
}

function formatETA(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`
    if (hours > 0) return `~${hours}h`
    return minutes > 0 ? `~${minutes}m` : 'soon'
}

export const commands: CommandDefinition[] = [
    {
        name: 'help',
        description: 'Show available commands',
        execute: async ({ handler, event, safeSendMessage }) => {
            await safeSendMessage(
                handler,
                event.channelId,
                [
                    'Franky — Commands',
                    '',
                    '• /airing <title>',
                    '• /recommend <vibe>',
                    '• /quote',
                    '• /guess_anime',
                    '• /news',
                    '• /calendar',
                    '• /ping',
                    '• /diag',
                    '',
                    'Moderation (admins):',
                    '',
                    '• /ban @user • /mute @user 10m • /purge 25',
                ].join('\n')
            )
        },
    },
    {
        name: 'airing',
        description: 'Check next airing episode for an anime',
        execute: async ({ handler, event, safeSendMessage }) => {
            const title = event.args.join(' ').trim()
            if (!title) {
                await safeSendMessage(handler, event.channelId, 'Usage: `/airing <title>`\nExample: `/airing One Piece`')
                return
            }
            try {
                const info = await getAiringInfo(title)
                if (!info) {
                    await safeSendMessage(handler, event.channelId, 'Not found. Try a different title.')
                    return
                }
                if (info.nextEpisode !== null && info.timeUntilSeconds !== null) {
                    const eta = formatETA(info.timeUntilSeconds)
                    await safeSendMessage(handler, event.channelId, `📺 ${info.title}\nNext ep: ~${eta} | #${info.nextEpisode}\n${info.siteUrl}`)
                } else {
                    await safeSendMessage(handler, event.channelId, `📺 ${info.title}\nNo upcoming episode info.\n${info.siteUrl}`)
                }
            } catch (error) {
                await safeSendMessage(handler, event.channelId, 'AniList is not responding right now. Please try again later.')
                console.error('AniList error:', error)
            }
        },
    },
    {
        name: 'recommend',
        description: 'Get anime recommendations for a vibe',
        execute: async ({ handler, event, safeSendMessage }) => {
            const vibe = event.args.join(' ').trim() || 'action'
            try {
                const recs = await getRecommendations(vibe)
                if (recs.length === 0) {
                    await safeSendMessage(handler, event.channelId, `No anime found for "${vibe}". Try a different genre.`)
                    return
                }
                let msg = `🎯 Top ${recs.length} "${vibe}" anime\n\n`
                for (const rec of recs) {
                    msg += `• ${rec.title} — eps: ${rec.episodes ?? '?'} — score: ${rec.score ?? '?'}\n${rec.siteUrl}\n\n`
                }
                await safeSendMessage(handler, event.channelId, msg.trim())
            } catch (error) {
                await safeSendMessage(handler, event.channelId, 'AniList is not responding right now. Please try again later.')
                console.error('AniList error:', error)
            }
        },
    },
    {
        name: 'quote',
        description: 'Send a random anime quote',
        execute: async ({ handler, event, safeSendMessage }) => {
            const quote = ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)]
            await safeSendMessage(handler, event.channelId, `💬 "${quote.quote}" — ${quote.character}`)
        },
    },
    {
        name: 'guess_anime',
        description: 'Start a guess-the-anime trivia game (admins only)',
        execute: async ({ handler, event, safeSendMessage, bot }) => {
            const isAdmin = await handler.hasAdminPermission(event.userId, event.spaceId)
            if (!isAdmin) {
                await safeSendMessage(handler, event.channelId, '❌ Admin only.')
                return
            }
            if (activeTriviaGames.has(event.channelId)) {
                await safeSendMessage(handler, event.channelId, '❌ Game already active. Wait for it to finish.')
                return
            }
            const question = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)]
            await safeSendMessage(handler, event.channelId, `**🎮 Guess the Anime**\n\n${question.clue}\n\n*60 seconds to answer!*`)
            const timeoutId = setTimeout(async () => {
                const game = activeTriviaGames.get(event.channelId)
                activeTriviaGames.delete(event.channelId)
                if (game && !game.hasWinner && bot) {
                    try {
                        await bot.sendMessage(event.channelId, `⏰ Time's up! Answer: **${question.answer}**`)
                    } catch (error) {
                        const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code?: string }).code : 'unknown'
                        const errorMessage = error instanceof Error ? error.message : String(error)
                        console.error(`[SEND-ERROR] code=${errorCode ?? 'unknown'} message="${errorMessage}"`)
                    }
                }
            }, 60000)
            activeTriviaGames.set(event.channelId, {
                answer: question.answer,
                clue: question.clue,
                hasWinner: false,
                timeoutId,
            })
        },
    },
    {
        name: 'news',
        description: 'Show latest anime news (coming soon)',
        execute: async ({ handler, event, safeSendMessage }) => {
            await safeSendMessage(handler, event.channelId, '📰 Anime news (coming soon).')
        },
    },
    {
        name: 'calendar',
        description: 'Show anime airing calendar (coming soon)',
        execute: async ({ handler, event, safeSendMessage }) => {
            await safeSendMessage(handler, event.channelId, '🗓️ Weekly airing calendar (coming soon).')
        },
    },
    {
        name: 'ban',
        description: 'Ban a user (admins only)',
        execute: async ({ handler, event, safeSendMessage }) => {
            const isAdmin = await handler.hasAdminPermission(event.userId, event.spaceId)
            if (!isAdmin) {
                await safeSendMessage(handler, event.channelId, '❌ Admin only.')
                return
            }
            const userToBan = event.mentions[0]?.userId || event.args[0]
            if (!userToBan || !userToBan.startsWith('0x') || userToBan.length !== 42) {
                await safeSendMessage(handler, event.channelId, '❌ Usage: `/ban @user` or `/ban <userId>`')
                return
            }
            try {
                await handler.ban(userToBan, event.spaceId)
                console.log(`[${new Date().toISOString()}] 🔨 Banned ${userToBan} by ${event.userId}`)
                await safeSendMessage(handler, event.channelId, `✅ Banned <@${userToBan}>`)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'
                await safeSendMessage(handler, event.channelId, `❌ Failed: ${message}`)
            }
        },
    },
    {
        name: 'mute',
        description: 'Mute a user (admins only, placeholder)',
        execute: async ({ handler, event, safeSendMessage }) => {
            const isAdmin = await handler.hasAdminPermission(event.userId, event.spaceId)
            if (!isAdmin) {
                await safeSendMessage(handler, event.channelId, '❌ Admin only.')
                return
            }
            const userToMute = event.mentions[0]?.userId || event.args[0]
            if (!userToMute) {
                await safeSendMessage(handler, event.channelId, '❌ Usage: `/mute @user`')
                return
            }
            console.log(`[${new Date().toISOString()}] 🔇 Muted ${userToMute} by ${event.userId}`)
            await safeSendMessage(handler, event.channelId, `🔇 Muted <@${userToMute}>\nNote: Actual muting coming soon.`)
        },
    },
    {
        name: 'purge',
        description: 'Purge recent messages (admins only, placeholder)',
        execute: async ({ handler, event, safeSendMessage }) => {
            const isAdmin = await handler.hasAdminPermission(event.userId, event.spaceId)
            if (!isAdmin) {
                await safeSendMessage(handler, event.channelId, '❌ Admin only.')
                return
            }
            const count = Number.parseInt(event.args[0] ?? '', 10)
            if (Number.isNaN(count) || count < 1 || count > 100) {
                await safeSendMessage(handler, event.channelId, '❌ Usage: `/purge 25` (1-100)')
                return
            }
            console.log(`[${new Date().toISOString()}] 🗑️ Purge ${count} messages by ${event.userId}`)
            await safeSendMessage(handler, event.channelId, `🗑️ Purge ${count} messages...\nNote: Implementation coming soon.`)
        },
    },
    {
        name: 'ping',
        description: 'Check if Franky is responsive',
        execute: async ({ handler, event, safeSendMessage }) => {
            await safeSendMessage(handler, event.channelId, '🏓 Pong! Franky is online.')
        },
    },
    {
        name: 'diag',
        description: 'Show diagnostic information',
        execute: async ({ handler, event, safeSendMessage, startTime }) => {
            const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000)
            const diagnostics = [
                'Franky diagnostics',
                `• Uptime: ${uptimeSeconds}s`,
                `• Channel: ${event.channelId}`,
                `• User: ${event.userId}`,
                `• Args: ${event.args.join(' ') || '(none)'}`,
            ].join('\n')
            await safeSendMessage(handler, event.channelId, diagnostics)
        },
    },
]

export type CommandsList = typeof commands

