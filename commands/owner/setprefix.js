import config from '../../config.js'

export default {
  name: 'setprefix',
  ownerOnly: true,
  description: 'Change the bot prefix',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const newPrefix = text.slice(config.prefix.length + 'setprefix'.length).trim()

    if (!newPrefix) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a new prefix.

*Usage:* ${config.prefix}setprefix <prefix>
*Example:* ${config.prefix}setprefix .

*Current prefix:* ${config.prefix}`,
        quoted: msg
      })
      return
    }

    if (newPrefix.length > 3) {
      await sock.sendMessage(chatJid, {
        text: '❌ Prefix must be 3 characters or less.',
        quoted: msg
      })
      return
    }

    const oldPrefix = config.prefix

    // update prefix in memory
    config.prefix = newPrefix

    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║     ⚡ PREFIX CHANGED   ║
╚════════════════════════╝

✅ Prefix updated successfully!

*Old prefix:* ${oldPrefix}
*New prefix:* ${newPrefix}

⚠️ *Note:* This change is temporary and will reset when the bot restarts. To make it permanent update your *config.js* file.`,
      quoted: msg
    })
  }
}