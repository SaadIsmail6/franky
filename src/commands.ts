import type { Bot, BotHandler } from '@towns-protocol/bot'
import { getRecommendations } from './anilist'
import { fetchUpcomingAiring, formatAiringList, type AiringItem } from './integrations/anilist'

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
    registerSlash?: boolean
}

export function resolveBotIdentity(currentBot: Bot<any, any> | null): { appId: string; name: string } {
    if (!currentBot) {
        return { appId: 'unknown', name: 'unknown' }
    }
    const candidateAppId =
        (currentBot as unknown as { appAddress?: string }).appAddress ??
        (currentBot as unknown as { appId?: string }).appId ??
        (currentBot as unknown as { botId?: string }).botId ??
        (currentBot as unknown as { app?: { appId?: string; id?: string } }).app?.appId ??
        (currentBot as unknown as { app?: { appId?: string; id?: string } }).app?.id
    const candidateName =
        (currentBot as unknown as { app?: { name?: string; displayName?: string } }).app?.name ??
        (currentBot as unknown as { app?: { name?: string; displayName?: string } }).app?.displayName ??
        (currentBot as unknown as { name?: string }).name ??
        (currentBot as unknown as { botName?: string }).botName ??
        (currentBot as unknown as { displayName?: string }).displayName

    return {
        appId: typeof candidateAppId === 'string' ? candidateAppId : 'unknown',
        name: typeof candidateName === 'string' ? candidateName : 'unknown',
    }
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

const COMMAND_DESCRIPTIONS: Record<string, string> = {
    help: 'Show available commands',
    airing: 'Anime airings: now, today, week, or by title',
    calendar: "Alias: shows this week's schedule",
    recommend: 'Get anime recommendations for a vibe',
    quote: 'Send a random anime quote',
    guess_anime: 'Start a guess-the-anime trivia game (admins only)',
    news: 'Show latest anime news (coming soon)',
    ban: 'Ban a user (admins only)',
    mute: 'Mute a user (admins only)',
    purge: 'Purge recent messages (admins only)',
}

const DEFAULT_TZ = process.env.FRANKY_TZ || 'America/Toronto'

type ForcedAiringOptions = {
    forcedMode?: 'now' | 'today' | 'week'
    forcedQuery?: string
    note?: string
}

const AIRING_MODES = new Set(['now', 'today', 'week'])

function getDayBounds(nowMs: number, tz: string): { start: number; end: number } {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        })
        const parts = formatter.formatToParts(new Date(nowMs))
        const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))
        const year = Number(lookup.year)
        const month = Number(lookup.month)
        const day = Number(lookup.day)
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
            throw new Error('Invalid date parts')
        }
        const start = Date.UTC(year, month - 1, day, 0, 0, 0, 0)
        const end = Date.UTC(year, month - 1, day, 23, 59, 59, 999)
        return { start, end }
    } catch {
        const today = new Date(nowMs)
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
        const end = start + 24 * 60 * 60 * 1000 - 1
        return { start, end }
    }
}

async function runAiringCommand(
    ctx: CommandExecuteContext,
    overrides: ForcedAiringOptions = {}
): Promise<void> {
    const { handler, event, safeSendMessage } = ctx
    const tz = DEFAULT_TZ
    const args = event.args
    const baseMode = args[0]?.toLowerCase()
    let mode: 'default' | 'now' | 'today' | 'week' | 'title' = 'default'
    let titleQuery: string | undefined

    if (overrides.forcedMode) {
        mode = overrides.forcedMode
    } else if (baseMode && AIRING_MODES.has(baseMode)) {
        mode = baseMode as typeof mode
    } else if (args.length > 0) {
        titleQuery = args.join(' ')
        mode = 'title'
    }

    if (overrides.forcedQuery) {
        titleQuery = overrides.forcedQuery
        mode = 'title'
    }

    let items: AiringItem[] = []
    try {
        if (mode === 'title' && titleQuery) {
            items = await fetchUpcomingAiring({ query: titleQuery, perPage: 5 })
        } else {
            const perPage = mode === 'default' ? 15 : 25
            items = await fetchUpcomingAiring({ perPage })
        }
    } catch (error) {
        console.error('[AIRING] fetch failed', error)
        await safeSendMessage(handler, event.channelId, 'AniList is unavailable right now. Try again later.')
        return
    }

    const nowMs = Date.now()
    if (mode === 'now') {
        const end = nowMs + 3 * 60 * 60 * 1000
        items = items.filter((item) => {
            const timestamp = item.airingAt * 1000
            return timestamp >= nowMs && timestamp <= end
        })
    } else if (mode === 'today') {
        const { start, end } = getDayBounds(nowMs, tz)
        items = items.filter((item) => {
            const timestamp = item.airingAt * 1000
            return timestamp >= start && timestamp <= end
        })
    } else if (mode === 'week') {
        const end = nowMs + 7 * 24 * 60 * 60 * 1000
        items = items.filter((item) => {
            const timestamp = item.airingAt * 1000
            return timestamp >= nowMs && timestamp <= end
        })
    }

    const header =
        mode === 'now'
            ? '📺 Airing Now / Soon'
            : mode === 'today'
            ? '📅 Airing Today'
            : mode === 'week'
            ? '🗓️ Airing This Week'
            : mode === 'title' && titleQuery
            ? `🎞️ Upcoming for ${titleQuery}`
            : '📺 Upcoming Episodes'

    console.log(`[AIRING] mode=${mode} query="${titleQuery || ''}" count=${items.length}`)

    if (items.length === 0) {
        const baseMessage = 'No upcoming episodes found.'
        const outputMessage = overrides.note ? `${overrides.note}\n\n${baseMessage}` : baseMessage
        await safeSendMessage(handler, event.channelId, outputMessage)
        console.log(`[AIRING] reply chars=${outputMessage.length} items=0`)
        return
    }

    const limit = 5
    const message = formatAiringList(items, {
        limit,
        tz,
        header,
        groupByDay: mode === 'week' || mode === 'today',
    })

    const finalMessage = overrides.note ? `${overrides.note}\n\n${message}` : message
    await safeSendMessage(handler, event.channelId, finalMessage)
    console.log(`[AIRING] reply chars=${finalMessage.length} items=${Math.min(items.length, limit)}`)
    if (finalMessage.includes('…and more')) {
        console.log('[AIRING] truncated output to fit')
    }
}

export const commands: CommandDefinition[] = [
    {
        name: 'help',
        description: 'Show available commands',
        execute: async ({ handler, event, safeSendMessage }) => {
            const target = event.args[0]?.toLowerCase()
            const commandNames = new Set(commands.map((command) => command.name))
            const isAdmin = await handler.hasAdminPermission(event.userId, event.spaceId)

            const sections: Array<{
                key: string
                label: string
                example?: string
                requires?: string[]
                customCondition?: boolean
                isAdmin?: boolean
            }> = [
                {
                    key: 'airing',
                    label: '/airing — Anime airings (now/today/week or by title)',
                    example: '  e.g. /airing, /airing week, /airing one piece',
                },
                {
                    key: 'calendar',
                    label: '/calendar — Alias of /airing week',
                    example: '  e.g. /calendar',
                },
                {
                    key: 'recommend',
                    label: '/recommend — Get anime recs',
                    example: '  e.g. /recommend shonen',
                },
                {
                    key: 'quote',
                    label: '/quote — Random anime quote',
                    example: '  e.g. /quote',
                },
                {
                    key: 'guess_anime',
                    label: '/guess_anime — Guess-the-anime game',
                    example: '  e.g. /guess_anime',
                    isAdmin: true,
                },
                {
                    key: 'news',
                    label: '/news — Show latest anime news (coming soon)',
                    example: '  e.g. /news',
                },
            ]

            if (target) {
                const section = sections.find((section) => section.key === target)
                if (section) {
                    // Check if section requires admin and user is not admin
                    if (section.isAdmin && !isAdmin) {
                        await safeSendMessage(handler, event.channelId, `Unknown command "${target}". Try \`/help\`.`)
                        return
                    }
                    const requiredCommands = section.requires ?? [section.key]
                    const available = requiredCommands.every((name) => commandNames.has(name))
                    if (available) {
                        const lines: string[] = [section.label]
                        if (section.example) {
                            lines.push(section.example)
                        }
                        await safeSendMessage(handler, event.channelId, lines.join('\n'))
                        return
                    }
                }
                await safeSendMessage(handler, event.channelId, `Unknown command "${target}". Try \`/help\`.`)
                return
            }

            const lines: string[] = ['🤖 Franky Commands', '']

            for (const section of sections) {
                // Skip admin-only sections for non-admin users
                if (section.isAdmin && !isAdmin) {
                    continue
                }
                const requiredCommands = section.requires ?? [section.key]
                const available = requiredCommands.every((name) => commandNames.has(name))
                if (!available) continue
                lines.push(section.label)
                if (section.example) {
                    lines.push(section.example)
                }
                lines.push('')
            }

            if (lines[lines.length - 1] === '') {
                lines.pop()
            }

            lines.push('', 'Tip: Type commands as messages that start with "/".')

            const helpText = lines.join('\n').slice(0, 900)
            await safeSendMessage(handler, event.channelId, helpText)
        },
    },
    {
        name: 'airing',
        description: 'Anime airings: now, today, week, or by title',
        execute: async (ctx) => {
            await runAiringCommand(ctx)
        },
    },
    {
        name: 'calendar',
        description: "Alias: shows this week's schedule",
        registerSlash: false,
        execute: async (ctx) => {
            console.log('[ALIAS] /calendar -> /airing week')
            await runAiringCommand(ctx, {
                forcedMode: 'week',
                note: 'Note: `/calendar` is deprecated. Use `/airing week`.',
            })
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
            await safeSendMessage(handler, event.channelId, `**🎮 Guess the Anime**\n\n${question.clue}\n\n*15 seconds to answer!*`)
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
            }, 15000)
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
]

export type CommandsList = typeof commands

