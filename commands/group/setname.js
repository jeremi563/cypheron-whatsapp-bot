import config from '../../config.js'

export default {
  name: 'setname',
  ownerOnly: false,
  description: 'Change group name',
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

    const newName = text.slice(config.prefix.length + 'setname'.length).trim()

    if (!newName) {
      await sock.sendMessage(chatJid, {
        text: `❌ Please provide a new name.\n\n*Usage:* ${config.prefix}setname <new name>`,
        quoted: msg
      })
      return
    }

    // check if bot is admin
    try {
      const groupMetadata = await sock.groupMetadata(chatJid)
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const botParticipant = groupMetadata.participants.find(p => p.id === botId)

      if (!botParticipant?.admin) {
        await sock.sendMessage(chatJid, {
          text: '❌ I need to be an admin to change the group name.',
          quoted: msg
        })
        return
      }

      await sock.groupUpdateSubject(chatJid, newName)
      await sock.sendMessage(chatJid, {
        text: `✅ Group name changed to: *${newName}*`,
        quoted: msg
      })
    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to change group name: ${err.message}`,
        quoted: msg
      })
    }
  }
}