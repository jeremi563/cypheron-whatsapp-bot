import config from '../../config.js'

const bioQuotes = [
  "Always online ⚡",
  "Never sleeping 🌙",
  "Ready 24/7 💪",
  "404: Sleep not found👾💀",
  "Built different 🚀",
  "Debugging life since birth 🛸🔧",
  "git push --force reality 🌀⚙️",
  "Stay sharp 🧠",
  "Locked in 🎯",
  "No days off 👊",
  "Code.Eat.Repeat💾",
  "sudo make me unstoppable 👑💻",
  "Ctrl+Alt+Unstoppable 🤯⌨️",
  "Binary beast mode ON 🦾01"
]

let bioInterval = null
let isRunning = false
let currentSock = null
let consecutiveErrors = 0
const MAX_ERRORS = 3

// ✅ update interval — 5 minutes is safe to avoid rate limiting
const UPDATE_INTERVAL = 3 * 60 * 1000

function getRandomQuote() {
  return bioQuotes[Math.floor(Math.random() * bioQuotes.length)]
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: config.timezone
  })
}

// ✅ called from index.js on startup and on reconnect
export function startAutoBio(sock) {
  // ✅ always clear any existing interval first
  if (bioInterval) {
    clearInterval(bioInterval)
    bioInterval = null
  }

  // ✅ always update sock to latest instance
  currentSock = sock
  isRunning = true
  consecutiveErrors = 0

  const updateBio = async () => {
    // ✅ safety check — if sock is gone skip this update
    if (!currentSock) return

    try {
      const bio = `🤖 ${config.botName} | 🕐 ${getCurrentTime()} | ${getRandomQuote()}`
      await currentSock.updateProfileStatus(bio)
      consecutiveErrors = 0 // ✅ reset error count on success
      console.log(`\x1b[32m✅ Bio updated successfully\x1b[0m`)
    } catch (err) {
      consecutiveErrors++
      console.error(`Bio update error (${consecutiveErrors}/${MAX_ERRORS}): ${err.message}`)

      // ✅ only stop if too many consecutive errors
      // this prevents one bad update from killing the entire feature
      if (consecutiveErrors >= MAX_ERRORS) {
        console.error('Bio update paused — too many consecutive errors')

        // ✅ do NOT set isRunning to false
        // just pause the interval and retry after longer wait
        clearInterval(bioInterval)
        bioInterval = null

        // ✅ auto restart after 10 minutes
        setTimeout(() => {
          if (isRunning && currentSock) {
            console.log('\x1b[33m⚠️  Retrying bio update...\x1b[0m')
            consecutiveErrors = 0
            bioInterval = setInterval(updateBio, UPDATE_INTERVAL)
            updateBio()
          }
        }, 10 * 60 * 1000)
      }
    }
  }

  // ✅ run immediately then every 5 minutes
  updateBio()
  bioInterval = setInterval(updateBio, UPDATE_INTERVAL)
}

export function stopAutoBio() {
  if (!isRunning) return

  clearInterval(bioInterval)
  bioInterval = null
  isRunning = false
  consecutiveErrors = 0

  // ✅ reset bio to default
  if (currentSock) {
    currentSock.updateProfileStatus(`🤖 ${config.botName} | Always online ⚡`)
      .catch(err => console.error('Bio reset error:', err.message))
  }

  currentSock = null
}

export default {
  name: 'autobio',
  ownerOnly: true,
  description: 'Toggle live auto-updating WhatsApp bio',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const option = args[0]?.toLowerCase()

    if (!option || (option !== 'on' && option !== 'off')) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      ✏️  AUTO BIO        ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}autobio on — start live bio
- ${config.prefix}autobio off — stop live bio

*Status:* ${isRunning ? '🟢 Running' : '🔴 Stopped'}
*Interval:* Every 3 minutes

*Bio Format:*
_🤖 CYPHERON | 🕐 02:45 PM | Always online ⚡_`
      }, { quoted: msg })
      return
    }

    if (option === 'on') {
      if (isRunning && bioInterval) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto bio is already *running!*\nType *${config.prefix}autobio off* to stop it.`
        }, { quoted: msg })
        return
      }

      startAutoBio(sock)

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      ✏️  AUTO BIO        ║
╚════════════════════════╝

✅ *Auto bio is now ON!*

*Format:*
_🤖 CYPHERON | 🕐 02:45 PM | Always online ⚡_

Updates every *3 minutes*
Type *${config.prefix}autobio off* to stop.`
      }, { quoted: msg })

    } else if (option === 'off') {
      if (!isRunning) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto bio is already *stopped!*\nType *${config.prefix}autobio on* to start it.`
        }, { quoted: msg })
        return
      }

      stopAutoBio()

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      ✏️  AUTO BIO        ║
╚════════════════════════╝

🔴 *Auto bio stopped!*

Bio reset to default.
Type *${config.prefix}autobio on* to restart.`
      }, { quoted: msg })
    }
  }
}