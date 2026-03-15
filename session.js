import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

export function decodeSession(sessionId, authFolder) {
  try {
    // remove our prefix
    if (!sessionId.startsWith('CYPHERON_')) {
      throw new Error('Invalid session ID format')
    }

    const encoded = sessionId.replace('CYPHERON_', '')

    // decode from base64
    const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))

    // recreate the auth folder
    if (!existsSync(authFolder)) {
      mkdirSync(authFolder, { recursive: true })
    }

    // write each file back
    for (const [filename, content] of Object.entries(decoded)) {
      writeFileSync(join(authFolder, filename), content, 'utf8')
    }

    return true
  } catch (err) {
    console.error('Session decode error:', err.message)
    return false
  }
}

export function hasValidSession(sessionId) {
  return sessionId &&
    typeof sessionId === 'string' &&
    sessionId.startsWith('CYPHERON_') &&
    sessionId.length > 20
}