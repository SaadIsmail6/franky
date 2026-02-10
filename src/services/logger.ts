/**
 * Franky v2 – structured logging per module/tool.
 */

const PREFIX = '[FRANKY]'

export function logAgent(message: string, meta?: Record<string, unknown>): void {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : ''
  console.log(`${PREFIX}[AGENT] ${message}${suffix}`)
}

export function logIntent(message: string, meta?: Record<string, unknown>): void {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : ''
  console.log(`${PREFIX}[INTENT] ${message}${suffix}`)
}

export function logTool(tool: string, message: string, meta?: Record<string, unknown>): void {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : ''
  console.log(`${PREFIX}[TOOL:${tool}] ${message}${suffix}`)
}

export function logData(component: string, message: string, meta?: Record<string, unknown>): void {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : ''
  console.log(`${PREFIX}[DATA:${component}] ${message}${suffix}`)
}

export function logError(component: string, message: string, err?: unknown): void {
  const errStr = err instanceof Error ? err.message : String(err)
  console.error(`${PREFIX}[ERROR:${component}] ${message} ${errStr}`)
}
