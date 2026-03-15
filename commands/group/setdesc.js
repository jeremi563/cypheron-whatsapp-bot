import config from '../../config.js'

export default {
  name: 'setdesc',
  ownerOnly: false,
  description: 'Change group description',
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

    const newDesc = text.slice(config.prefix.length + 'setdesc'.length).trim()

    if (!newDesc) {
      await sock.sendMessage(chatJid, {
        text: `❌ Please provide a new description.\n\n*Usage:* ${config.prefix}setdesc <new description>`,
        quoted: msg
      })
      return
    }

    try {
      const groupMetadata = await sock.groupMetadata(chatJid)
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const botParticipant = groupMetadata.participants.find(p => p.id === botId)

      if (!botParticipant?.admin) {
        await sock.sendMessage(chatJid, {
          text: '❌ I need to be an admin to change the group description.',
          quoted: msg
        })
        return
      }

      await sock.groupUpdateDescription(chatJid, newDesc)
      await sock.sendMessage(chatJid, {
        text: `✅ Group description updated successfully!`,
        quoted: msg
      })
    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to change group description: ${err.message}`,
        quoted: msg
      })
    }
  }
}