import type { PlainMessage, SlashCommand } from '@towns-protocol/proto'

/**
 * Slash commands available in the Franky bot
 */
const commands = [
    {
        name: 'help',
        description: 'Get help with bot commands',
    },
    {
        name: 'airing',
        description: 'Check currently airing anime',
    },
    {
        name: 'recommend',
        description: 'Get anime recommendations',
    },
    {
        name: 'quote',
        description: 'Get a random anime quote',
    },
    {
        name: 'guess-anime',
        description: 'Play guess the anime game (admin only)',
    },
    {
        name: 'news',
        description: 'Get the latest anime news',
    },
    {
        name: 'calendar',
        description: 'View anime release calendar',
    },
    {
        name: 'ban',
        description: 'Ban a user from the space (admin only)',
    },
    {
        name: 'mute',
        description: 'Mute a user in the channel (admin only)',
    },
    {
        name: 'purge',
        description: 'Delete multiple messages (admin only)',
    },
] as const satisfies PlainMessage<SlashCommand>[]

export default commands
