const cooldowns = new Map()

const COOLDOWN_TIME = 30 * 60 * 1000

export function shouldWelcome(sender) {
  const now = Date.now()
  const lastSeen = cooldowns.get(sender)

  if (!lastSeen || (now - lastSeen) >= COOLDOWN_TIME) {
    cooldowns.set(sender, now)
    return true
  }

  return false
}