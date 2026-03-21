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
let currentSock = null // ✅ track current sock instance

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
  // ✅ if already running with a different sock — stop old interval first
  if (bioInterval) {
    clearInterval(bioInterval)
    bioInterval = null
  }

  isRunning = true
  currentSock = sock // ✅ always update to latest sock instance

  const updateBio = async () => {
    try {
      // ✅ use currentSock so reconnects dont break it
      const bio = `🤖 ${config.botName} | 🕐 ${getCurrentTime()} | ${getRandomQuote()}`
      await currentSock.updateProfileStatus(bio)
    } catch (err) {
      // ✅ if connection is lost stop the interval to prevent spam errors
      if (
        err.message?.includes('Connection Closed') ||
        err.message?.includes('timed out') ||
        err.message?.includes('not-authorized')
      ) {
        console.error('Bio update paused — connection issue:', err.message)
        clearInterval(bioInterval)
        bioInterval = null
        isRunning = false
      } else {
        console.error('Bio update error:', err.message)
      }
    }
  }

  // ✅ run immediately then every 60 seconds
  updateBio()
  bioInterval = setInterval(updateBio, 60 * 1000)
}

export function stopAutoBio() {
  if (!isRunning) return

  clearInterval(bioInterval)
  bioInterval = null
  isRunning = false

  // ✅ reset bio if sock is available
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

    // ✅ use args parameter passed from index.js
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

*Bio Format:*
_🤖 CYPHERON | 🕐 02:45 PM | Always online ⚡_`
      }, { quoted: msg })
      return
    }

    if (option === 'on') {
      if (isRunning) {
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

Updates every *1 minute*
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