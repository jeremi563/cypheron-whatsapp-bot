import config from '../../config.js'
import { setWelcomeEnabled, getWelcomeEnabled, resetCooldown } from '../../cooldown.js'

export default {
  name: 'autowelcome',
  ownerOnly: true,
  description: 'Toggle auto welcome message for new chats',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const args = text.trim().split(' ')
    const option = args[1]?.toLowerCase()

    if (!option) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    👋 AUTO WELCOME      ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}autowelcome on — enable welcome
- ${config.prefix}autowelcome off — disable welcome
- ${config.prefix}autowelcome reset <number> — reset cooldown for a number

*Status:* ${getWelcomeEnabled() ? '🟢 ON' : '🔴 OFF'}

*How it works:*
- First time someone messages → welcome sent ✅
- Same person messages again within 30 mins → no welcome ✅
- Hidden last seen users → welcome sent once only ✅
- After 30 mins of silence → welcome sent again ✅`,
        quoted: msg
      })
      return
    }

    if (option === 'on') {
      if (getWelcomeEnabled()) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto welcome is already *ON!*`,
          quoted: msg
        })
        return
      }

      setWelcomeEnabled(true)

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    👋 AUTO WELCOME      ║
╚════════════════════════╝

✅ *Auto welcome is now ON!*

New contacts will receive a welcome message when they first message you or after 30 minutes of silence.

Type *${config.prefix}autowelcome off* to disable.`,
        quoted: msg
      })

    } else if (option === 'off') {
      if (!getWelcomeEnabled()) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto welcome is already *OFF!*`,
          quoted: msg
        })
        return
      }

      setWelcomeEnabled(false)

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    👋 AUTO WELCOME      ║
╚════════════════════════╝

🔴 *Auto welcome is now OFF!*

No welcome messages will be sent.

Type *${config.prefix}autowelcome on* to enable.`,
        quoted: msg
      })

    } else if (option === 'reset') {
      const number = args[2]

      if (!number) {
        await sock.sendMessage(chatJid, {
          text: `❌ Please provide a number.\n\n*Usage:* ${config.prefix}autowelcome reset 254712345678`,
          quoted: msg
        })
        return
      }

      const cleanNumber = number.replace(/[^0-9]/g, '')
      const jid = `${cleanNumber}@s.whatsapp.net`

      resetCooldown(jid)

      await sock.sendMessage(chatJid, {
        text: `✅ Cooldown reset for *+${cleanNumber}*\nThey will receive a welcome message on their next message.`,
        quoted: msg
      })

    } else {
      await sock.sendMessage(chatJid, {
        text: `❌ Unknown option. Type *${config.prefix}autowelcome* to see all options.`,
        quoted: msg
      })
    }
  }
}