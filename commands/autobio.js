import config from '../config.js'

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

function getRandomQuote() {
  return bioQuotes[Math.floor(Math.random() * bioQuotes.length)]
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// this function is called directly from index.js on startup
export function startAutoBio(sock) {
  if (isRunning) return

  isRunning = true

  const updateBio = async () => {
    try {
      const bio = `🤖 ${config.botName} | 🕐 ${getCurrentTime()} | ${getRandomQuote()}`
      await sock.updateProfileStatus(bio)
    } catch (err) {
      console.error('Bio update error:', err.message)
    }
  }

  // run immediately then every 60 seconds
  updateBio()
  bioInterval = setInterval(updateBio, 60 * 1000)
}

export function stopAutoBio(sock) {
  if (!isRunning) return

  clearInterval(bioInterval)
  bioInterval = null
  isRunning = false

  try {
    sock.updateProfileStatus(`🤖 ${config.botName} | Always online ⚡`)
  } catch (err) {
    console.error('Bio reset error:', err.message)
  }
}

export default {
  name: 'autobio',
  ownerOnly: true,
  description: 'Toggle live auto-updating WhatsApp bio',
  async execute(sock, chatJid, sender, msg, commands) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const args = text.trim().split(' ')
    const option = args[1]?.toLowerCase()

    if (!option || (option !== 'on' && option !== 'off')) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      ✏️  AUTO BIO        ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}autobio on — start live bio
- ${config.prefix}autobio off — stop live bio

*Status:* ${isRunning ? '🟢 Running' : '🔴 Stopped'}`,
        quoted: msg
      })
      return
    }

    if (option === 'on') {

      if (isRunning) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto bio is already *running!*\nType *${config.prefix}autobio off* to stop it.`,
          quoted: msg
        })
        return
      }

      startAutoBio(sock)

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      ✏️  AUTO BIO        ║
╚════════════════════════╝

✅ *Auto bio is now ON!*

Format:
_🤖 CYPHERON | 🕐 02:45 PM | Always online ⚡_

Updates every *1 minute*
Type *${config.prefix}autobio off* to stop.`,
        quoted: msg
      })

    } else if (option === 'off') {

      if (!isRunning) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto bio is already *stopped!*\nType *${config.prefix}autobio on* to start it.`,
          quoted: msg
        })
        return
      }

      stopAutoBio(sock)

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      ✏️  AUTO BIO        ║
╚════════════════════════╝

🔴 *Auto bio stopped!*

Bio reset to default.
Type *${config.prefix}autobio on* to restart.`,
        quoted: msg
      })
    }

  }
}