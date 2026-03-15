import config from '../../config.js'

export default {
  name: 'revoke',
  ownerOnly: false,
  description: 'Reset group invite link',
  async execute(sock, chatJid, sender, msg) {

    if (!chatJid.endsWith('@g.us')) {
      await sock.sendMessage(chatJid, {
        text: '❌ This command can only be used in groups.',
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
          text: '❌ I need to be an admin to reset the invite link.',
          quoted: msg
        })
        return
      }

      const newCode = await sock.groupRevokeInvite(chatJid)

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    🔗 INVITE LINK RESET  ║
╚════════════════════════╝

✅ Group invite link has been reset!

🔗 *New Invite Link:*
https://chat.whatsapp.com/${newCode}

⚠️ The old link is now invalid.`,
        detectLinks: true,
        quoted: msg
      })
    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to reset invite link: ${err.message}`,
        quoted: msg
      })
    }
  }
}