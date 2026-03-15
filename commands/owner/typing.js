import config from '../../config.js'

export default {
  name: 'typing',
  ownerOnly: true,
  description: 'Appear typing in a specific chat for X seconds',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const args = text.slice(config.prefix.length + 'typing'.length).trim().split(' ')
    const seconds = parseInt(args[0]) || 5

    if (seconds < 1) {
      await sock.sendMessage(chatJid, {
        text: '❌ Seconds must be at least 1.',
        quoted: msg
      })
      return
    }

    if (seconds > 60) {
      await sock.sendMessage(chatJid, {
        text: '❌ Seconds cannot exceed 60.',
        quoted: msg
      })
      return
    }

    try {
      // start typing
      await sock.sendPresenceUpdate('composing', chatJid)

      await sock.sendMessage(chatJid, {
        text: `⌨️ Appearing to type for *${seconds}* seconds...`,
        quoted: msg
      })

      // stop typing after specified seconds
      setTimeout(async () => {
        try {
          await sock.sendPresenceUpdate('paused', chatJid)
          await sock.sendMessage(chatJid, {
            text: `✅ Stopped typing after *${seconds}* seconds.`,
          })
        } catch {}
      }, seconds * 1000)

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to set typing status: ${err.message}`,
        quoted: msg
      })
    }
  }
}