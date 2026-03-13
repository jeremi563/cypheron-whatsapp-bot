// stores presence data for all tracked contacts
const presenceData = new Map()

// stores the list of contacts we are tracking
const trackedContacts = new Set()

export function startTracking(jid) {
  if (!trackedContacts.has(jid)) {
    trackedContacts.add(jid)
    presenceData.set(jid, {
      jid,
      isOnline: false,
      lastSeen: null,
      lastOnline: null,
      totalOnlineTime: 0,
      sessions: []
    })
  }
}

export function stopTracking(jid) {
  trackedContacts.delete(jid)
  presenceData.delete(jid)
}

export function getTrackedContacts() {
  return [...trackedContacts]
}

export function updatePresence(jid, presence) {
  // if contact is not being tracked ignore
  if (!presenceData.has(jid)) return

  const data = presenceData.get(jid)
  const now = Date.now()

  if (presence === 'available') {
    // contact just came online
    data.isOnline = true
    data.lastOnline = now

  } else if (presence === 'unavailable') {
    // contact just went offline
    if (data.isOnline && data.lastOnline) {
      // calculate how long they were online
      const duration = now - data.lastOnline

      // save this session
      data.sessions.push({
        from: data.lastOnline,
        to: now,
        duration
      })

      // add to total online time
      data.totalOnlineTime += duration
    }

    data.isOnline = false
    data.lastSeen = now
  }

  presenceData.set(jid, data)
}

export function getPresenceData(jid) {
  return presenceData.get(jid) || null
}

export function getAllPresenceData() {
  return [...presenceData.values()]
}

// format milliseconds into human readable time
export function formatDuration(ms) {
  if (!ms || ms <= 0) return '0s'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

// format timestamp to readable time
export function formatTime(timestamp) {
  if (!timestamp) return 'Never'
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}