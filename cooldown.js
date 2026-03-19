import config from './config.js'

const cooldowns = new Map()
const firstTimeSenders = new Set()

export function setWelcomeEnabled(value) {
  config.welcomeEnabled = value
}

export function getWelcomeEnabled() {
  return config.welcomeEnabled
}

// ✅ check if current time is within the welcome window
function isWithinWelcomeHours() {
  const now = new Date()

  const hour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: config.timezone
    }).format(now)
  )

  const start = config.welcomeStartHour
  const end = config.welcomeEndHour

  // ✅ overnight window e.g. 22:00 to 06:00
  if (start > end) {
    return hour >= start || hour < end
  }

  // ✅ same day window e.g. 09:00 to 17:00
  return hour >= start && hour < end
}

export function shouldWelcome(sender) {
  // ✅ if welcome is globally disabled return false
  if (!config.welcomeEnabled) return false

  // ✅ check if within allowed hours
  if (!isWithinWelcomeHours()) return false

  const now = Date.now()
  const cooldownMs = config.welcomeCooldown * 60 * 1000
  const lastSeen = cooldowns.get(sender)

  // ✅ first time ever messaging
  if (!lastSeen) {
    cooldowns.set(sender, now)
    firstTimeSenders.add(sender)
    return true
  }

  // ✅ hidden last seen — only send once per cooldown period
  const isFirstTimer = firstTimeSenders.has(sender)

  if (isFirstTimer) {
    if ((now - lastSeen) >= cooldownMs) {
      cooldowns.set(sender, now)
      return true
    }
    return false
  }

  // ✅ normal cooldown check
  if ((now - lastSeen) >= cooldownMs) {
    cooldowns.set(sender, now)
    return true
  }

  return false
}

export function markSenderActive(sender) {
  firstTimeSenders.delete(sender)
  cooldowns.set(sender, Date.now())
}

export function resetCooldown(sender) {
  cooldowns.delete(sender)
  firstTimeSenders.delete(sender)
}