import config from '../../config.js'
import { setWelcomeEnabled, getWelcomeEnabled, resetCooldown } from '../../cooldown.js'

export default {
  name: 'autowelcome',
  ownerOnly: true,
  description: 'Toggle auto welcome message for new chats',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const option = args[0]?.toLowerCase()

    if (!option) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    👋 AUTO WELCOME      ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}autowelcome on
- ${config.prefix}autowelcome off
- ${config.prefix}autowelcome hours <start> <end>
- ${config.prefix}autowelcome cooldown <minutes>
- ${config.prefix}autowelcome reset <number>

*Current Settings:*
🟢 *Status:* ${getWelcomeEnabled() ? 'ON' : 'OFF'}
🕐 *Hours:* ${config.welcomeStartHour}:00 — ${config.welcomeEndHour}:00
⏱️ *Cooldown:* ${config.welcomeCooldown} minutes

_Hours use 24hr format. Example: 22 = 10PM, 8 = 8AM_`
      }, { quoted: msg })
      return
    }

    if (option === 'on') {
      if (getWelcomeEnabled()) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto welcome is already *ON!*`
        }, { quoted: msg })
        return
      }
      setWelcomeEnabled(true)
      await sock.sendMessage(chatJid, {
        text:
`✅ *Auto welcome is now ON!*

🕐 Active from *${config.welcomeStartHour}:00* to *${config.welcomeEndHour}:00*
⏱️ Cooldown: *${config.welcomeCooldown} minutes*`
      }, { quoted: msg })

    } else if (option === 'off') {
      if (!getWelcomeEnabled()) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto welcome is already *OFF!*`
        }, { quoted: msg })
        return
      }
      setWelcomeEnabled(false)
      await sock.sendMessage(chatJid, {
        text: `🔴 *Auto welcome is now OFF!*`
      }, { quoted: msg })

    } else if (option === 'hours') {
      const start = parseInt(args[1])
      const end = parseInt(args[2])

      if (isNaN(start) || isNaN(end) || start < 0 || start > 23 || end < 0 || end > 23) {
        await sock.sendMessage(chatJid, {
          text:
`❌ Invalid hours. Use 24hr format 0-23.

*Usage:* ${config.prefix}autowelcome hours <start> <end>
*Example:* ${config.prefix}autowelcome hours 22 6

This sets welcome active from 10PM to 6AM`
        }, { quoted: msg })
        return
      }

      config.welcomeStartHour = start
      config.welcomeEndHour = end

      await sock.sendMessage(chatJid, {
        text:
`✅ *Welcome hours updated!*

🕐 Now active from *${start}:00* to *${end}:00*

⚠️ Update config.js to make permanent.`
      }, { quoted: msg })

    } else if (option === 'cooldown') {
      const minutes = parseInt(args[1])

      if (isNaN(minutes) || minutes < 1 || minutes > 1440) {
        await sock.sendMessage(chatJid, {
          text:
`❌ Invalid cooldown. Must be 1 to 1440 minutes.

*Usage:* ${config.prefix}autowelcome cooldown <minutes>
*Example:* ${config.prefix}autowelcome cooldown 30`
        }, { quoted: msg })
        return
      }

      config.welcomeCooldown = minutes

      await sock.sendMessage(chatJid, {
        text: `✅ *Cooldown updated to ${minutes} minutes!*`
      }, { quoted: msg })

    } else if (option === 'reset') {
      const number = args[1]

      if (!number) {
        await sock.sendMessage(chatJid, {
          text: `❌ Please provide a number.\n\n*Usage:* ${config.prefix}autowelcome reset 254712345678`
        }, { quoted: msg })
        return
      }

      const cleanNumber = number.replace(/[^0-9]/g, '')
      const jid = `${cleanNumber}@s.whatsapp.net`
      resetCooldown(jid)

      await sock.sendMessage(chatJid, {
        text: `✅ Cooldown reset for *+${cleanNumber}*`
      }, { quoted: msg })

    } else {
      await sock.sendMessage(chatJid, {
        text: `❌ Unknown option. Type *${config.prefix}autowelcome* to see all options.`
      }, { quoted: msg })
    }
  }
}