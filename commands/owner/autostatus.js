import config from '../../config.js'

export default {
  name: 'autostatus',
  ownerOnly: true,
  description: 'Toggle auto view, like and reply to statuses',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const option = args[0]?.toLowerCase()
    const value = args[1]?.toLowerCase()

    // ✅ show current status if no args
    if (!option) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     📺 AUTO STATUS      ║
╚════════════════════════╝

*Current Settings:*

👁️ *Auto View:* ${config.autoViewStatus ? '🟢 ON' : '🔴 OFF'}
❤️ *Auto Like:* ${config.autoLikeStatus ? '🟢 ON' : '🔴 OFF'}
💬 *Auto Reply:* ${config.autoReplyStatus ? '🟢 ON' : '🔴 OFF'}
📝 *Reply Message:* _${config.autoReplyMessage}_
😍 *Like Emoji:* ${config.autoLikeEmoji}

*Usage:*
- ${config.prefix}autostatus view on/off
- ${config.prefix}autostatus like on/off
- ${config.prefix}autostatus reply on/off
- ${config.prefix}autostatus message <your message>
- ${config.prefix}autostatus emoji <emoji>`
      }, { quoted: msg })
      return
    }

    // ✅ toggle auto view
    if (option === 'view') {
      if (!value || (value !== 'on' && value !== 'off')) {
        await sock.sendMessage(chatJid, {
          text: `❌ Usage: *${config.prefix}autostatus view on/off*`
        }, { quoted: msg })
        return
      }
      config.autoViewStatus = value === 'on'
      await sock.sendMessage(chatJid, {
        text: `👁️ Auto view status is now *${value.toUpperCase()}*`
      }, { quoted: msg })

    // ✅ toggle auto like
    } else if (option === 'like') {
      if (!value || (value !== 'on' && value !== 'off')) {
        await sock.sendMessage(chatJid, {
          text: `❌ Usage: *${config.prefix}autostatus like on/off*`
        }, { quoted: msg })
        return
      }
      config.autoLikeStatus = value === 'on'
      await sock.sendMessage(chatJid, {
        text: `❤️ Auto like status is now *${value.toUpperCase()}*`
      }, { quoted: msg })

    // ✅ toggle auto reply
    } else if (option === 'reply') {
      if (!value || (value !== 'on' && value !== 'off')) {
        await sock.sendMessage(chatJid, {
          text: `❌ Usage: *${config.prefix}autostatus reply on/off*`
        }, { quoted: msg })
        return
      }
      config.autoReplyStatus = value === 'on'
      await sock.sendMessage(chatJid, {
        text: `💬 Auto reply status is now *${value.toUpperCase()}*`
      }, { quoted: msg })

    // ✅ change reply message
    } else if (option === 'message') {
      const newMessage = args.slice(1).join(' ')
      if (!newMessage) {
        await sock.sendMessage(chatJid, {
          text: `❌ Usage: *${config.prefix}autostatus message <your message>*`
        }, { quoted: msg })
        return
      }
      config.autoReplyMessage = newMessage
      await sock.sendMessage(chatJid, {
        text: `📝 Auto reply message updated to:\n_${newMessage}_`
      }, { quoted: msg })

    // ✅ change like emoji
    } else if (option === 'emoji') {
      const newEmoji = args[1]
      if (!newEmoji) {
        await sock.sendMessage(chatJid, {
          text: `❌ Usage: *${config.prefix}autostatus emoji <emoji>*`
        }, { quoted: msg })
        return
      }
      config.autoLikeEmoji = newEmoji
      await sock.sendMessage(chatJid, {
        text: `😍 Auto like emoji updated to: ${newEmoji}`
      }, { quoted: msg })

    } else {
      await sock.sendMessage(chatJid, {
        text: `❌ Unknown option. Type *${config.prefix}autostatus* to see all options.`
      }, { quoted: msg })
    }
  }
}