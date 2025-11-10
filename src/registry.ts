const BACKOFF_DELAYS_MS = [200, 800, 2400]

function isConnectError(error: unknown): boolean {
    if (!(error instanceof Error)) return false
    const nameMatches = error.constructor?.name === 'ConnectError'
    const messageMatches = error.message?.toLowerCase().includes('connecterror')
    return Boolean(nameMatches || messageMatches)
}

function logStrategyFailure(strategy: string, error: unknown, names: string[]): void {
    if (isConnectError(error)) {
        const connectBody =
            typeof (error as { rawMessage?: string }).rawMessage === 'string'
                ? (error as { rawMessage: string }).rawMessage
                : typeof (error as { body?: unknown }).body === 'string'
                ? (error as { body: string }).body
                : typeof (error as { message?: string }).message === 'string'
                ? (error as { message: string }).message
                : null
        if (connectBody) {
            console.error(
                `[REGISTRY] ${strategy} ConnectError for names=${names.join(', ')} body=${connectBody}`
            )
        } else {
            console.error(
                `[REGISTRY] ${strategy} ConnectError for names=${names.join(', ')}:`,
                error
            )
        }
    } else {
        console.error(`[REGISTRY] ${strategy} failed for names=${names.join(', ')}:`, error)
    }
}

async function delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function registerSlashCommandsPortable(
    bot: any,
    names: string[],
    describe: (name: string) => { name: string; description: string }
): Promise<'registered' | 'skipped'> {
    const payload = names.map((name) => describe(name))
    if (payload.length === 0) {
        console.warn('[REGISTRY] no slash commands to register (empty payload)')
        return 'skipped'
    }

    const strategies: Array<{
        label: string
        available: boolean
        attempt: () => Promise<void>
    }> = [
        {
            label: 'registerSlashCommands',
            available: typeof bot?.registerSlashCommands === 'function',
            attempt: async () => {
                await bot.registerSlashCommands(payload)
            },
        },
        {
            label: 'registerCommands',
            available: typeof bot?.registerCommands === 'function',
            attempt: async () => {
                await bot.registerCommands(payload)
            },
        },
        {
            label: 'app.updateAppMetadata',
            available: typeof bot?.app?.updateAppMetadata === 'function',
            attempt: async () => {
                await bot.app.updateAppMetadata({ slashCommands: payload })
            },
        },
    ]

    const availableStrategies = strategies.filter((strategy) => strategy.available)

    if (availableStrategies.length === 0) {
        console.warn('[REGISTRY] no registration APIs available on bot – skipping registration step')
        return 'skipped'
    }

    console.log(
        `[REGISTRY] attempting strategies: ${availableStrategies
            .map((strategy) => strategy.label)
            .join(' | ')}`
    )

    let lastError: unknown = null

    for (let attemptIndex = 0; attemptIndex <= BACKOFF_DELAYS_MS.length; attemptIndex += 1) {
        for (const strategy of availableStrategies) {
            try {
                await strategy.attempt()
                console.log(
                    `[REGISTRY] registered OK with ${strategy.label} names=${names.join(', ')}`
                )
                return 'registered'
            } catch (error) {
                lastError = error
                logStrategyFailure(strategy.label, error, names)
            }
        }

        if (attemptIndex === BACKOFF_DELAYS_MS.length) {
            break
        }

        await delay(BACKOFF_DELAYS_MS[attemptIndex])
    }

    const finalMessage =
        lastError instanceof Error ? lastError.message : String(lastError ?? 'Unknown error')
    const finalError = new Error(
        `[REGISTRY] failed to register slash commands after retries: ${finalMessage}`
    )
    ;(finalError as { cause?: unknown }).cause = lastError ?? undefined
    throw finalError
}

