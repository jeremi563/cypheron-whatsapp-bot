const cooldowns = new Map()
const firstTimeSenders = new Set()

// 30 minutes in milliseconds
const COOLDOWN_TIME = 30 * 60 * 1000

// ✅ track if welcome is enabled globally
let welcomeEnabled = true

export function setWelcomeEnabled(value) {
  welcomeEnabled = value
}

export function getWelcomeEnabled() {
  return welcomeEnabled
}

export function shouldWelcome(sender) {
  // if welcome is disabled return false immediately
  if (!welcomeEnabled) return false

  const now = Date.now()
  const lastSeen = cooldowns.get(sender)

  // ✅ first time ever messaging
  if (!lastSeen) {
    cooldowns.set(sender, now)
    firstTimeSenders.add(sender)
    return true
  }

  // ✅ check if sender has hidden last seen
  // we detect this by checking if their timestamp
  // never gets updated beyond the first time
  const isFirstTimer = firstTimeSenders.has(sender)

  if (isFirstTimer) {
    // ✅ already sent once to this person
    // only send again if 30 minutes have passed
    if ((now - lastSeen) >= COOLDOWN_TIME) {
      cooldowns.set(sender, now)
      return true
    }
    return false
  }

  // normal cooldown check for everyone else
  if ((now - lastSeen) >= COOLDOWN_TIME) {
    cooldowns.set(sender, now)
    return true
  }

  return false
}

// ✅ mark a sender as having visible last seen
export function markSenderActive(sender) {
  firstTimeSenders.delete(sender)
  cooldowns.set(sender, Date.now())
}

export function resetCooldown(sender) {
  cooldowns.delete(sender)
  firstTimeSenders.delete(sender)
}