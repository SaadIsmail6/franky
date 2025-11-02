import type { PlainMessage, SlashCommand } from '@towns-protocol/proto'

/**
 * Slash commands available in the Franky bot
 * Command names must match /^[A-Za-z0-9_]+$/ (letters, numbers, underscores only)
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
        name: 'guess_anime',
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
    {
        name: 'ping',
        description: 'Ping the bot',
    },
    {
        name: 'diag',
        description: 'Get bot diagnostics',
    },
] as const satisfies PlainMessage<SlashCommand>[]

// Validate all command names match /^[A-Za-z0-9_]+$/
const COMMAND_NAME_REGEX = /^[A-Za-z0-9_]+$/
for (const cmd of commands) {
    if (!COMMAND_NAME_REGEX.test(cmd.name)) {
        throw new Error(`Invalid command name "${cmd.name}": must match /^[A-Za-z0-9_]+$/`)
    }
}

export default commands
