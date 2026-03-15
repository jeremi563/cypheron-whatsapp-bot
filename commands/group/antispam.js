import config from '../../config.js'

// store which groups have antispam enabled
const antispamGroups = new Map()

// store message timestamps per user per group
const messageTracker = new Map()

// spam threshold — 5 messages in 5 seconds
const SPAM_LIMIT = 5
const SPAM_WINDOW = 5000

export default {
  name: 'antispam',
  ownerOnly: false,
  description: 'Toggle anti spam protection in group',
  async execute(sock, chatJid, sender, msg) {

    if (!chatJid.endsWith('@g.us')) {
      await sock.sendMessage(chatJid, {
        text: '❌ This command can only be used in groups.',
        quoted: msg
      })
      return
    }

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const args = text.trim().split(' ')
    const option = args[1]?.toLowerCase()

    if (!option || (option !== 'on' && option !== 'off')) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      🛡️ ANTI SPAM       ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}antispam on — enable anti spam
- ${config.prefix}antispam off — disable anti spam

*Status:* ${antispamGroups.get(chatJid) ? '🟢 ON' : '🔴 OFF'}

_Triggers when a member sends more than ${SPAM_LIMIT} messages in ${SPAM_WINDOW / 1000} seconds._`,
        quoted: msg
      })
      return
    }

    antispamGroups.set(chatJid, option === 'on')

    await sock.sendMessage(chatJid, {
      text: `${option === 'on' ? '✅' : '🔴'} Anti spam is now *${option.toUpperCase()}* for this group.`,
      quoted: msg
    })
  }
}

// ✅ exported function to check messages for spam
export async function checkAntiSpam(sock, msg, chatJid, sender) {
  if (!antispamGroups.get(chatJid)) return
  if (!chatJid.endsWith('@g.us')) return

  const now = Date.now()
  const key = `${chatJid}_${sender}`

  // get or create tracker for this user in this group
  if (!messageTracker.has(key)) {
    messageTracker.set(key, [])
  }

  const timestamps = messageTracker.get(key)

  // add current timestamp
  timestamps.push(now)

  // remove timestamps outside the window
  const recentTimestamps = timestamps.filter(t => now - t < SPAM_WINDOW)
  messageTracker.set(key, recentTimestamps)

  // check if spam threshold exceeded
  if (recentTimestamps.length >= SPAM_LIMIT) {
    try {
      const groupMetadata = await sock.groupMetadata(chatJid)
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const botParticipant = groupMetadata.participants.find(p => p.id === botId)

      if (!botParticipant?.admin) return

      // dont warn admins
      const senderParticipant = groupMetadata.participants.find(p => p.id === sender)
      if (senderParticipant?.admin) return

      // reset tracker for this user
      messageTracker.set(key, [])

      // warn the sender
      await sock.sendMessage(chatJid, {
        text: `⚠️ @${sender.replace('@s.whatsapp.net', '')} Please stop spamming! You have been warned.`,
        mentions: [sender]
      })
    } catch (err) {
      console.error('Antispam error:', err.message)
    }
  }
}