import config from '../../config.js'

// ✅ read initial state from config
let antiViewOncePrivate = config.antiViewOncePrivate
let antiViewOnceGroup = config.antiViewOnceGroup

export function isAntiViewOncePrivateEnabled() {
  return antiViewOncePrivate
}

export function isAntiViewOnceGroupEnabled() {
  return antiViewOnceGroup
}

export default {
  name: 'antiviewonce',
  ownerOnly: true,
  description: 'Toggle anti view once for private and group chats',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const scope = args[0]?.toLowerCase()
    const option = args[1]?.toLowerCase()

    if (!scope || !option) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    👁️  ANTI VIEW ONCE   ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}antiviewonce private on/off
- ${config.prefix}antiviewonce group on/off

*Current Status:*
👤 *Private:* ${antiViewOncePrivate ? '🟢 ON' : '🔴 OFF'}
👥 *Group:* ${antiViewOnceGroup ? '🟢 ON' : '🔴 OFF'}

*How it works:*
👤 *Private* — view once media is automatically revealed and resent
👥 *Group* — someone replies to view once with *.vv* to reveal it`
      }, { quoted: msg })
      return
    }

    if (scope !== 'private' && scope !== 'group') {
      await sock.sendMessage(chatJid, {
        text: `❌ Invalid scope. Use *private* or *group*.`
      }, { quoted: msg })
      return
    }

    if (option !== 'on' && option !== 'off') {
      await sock.sendMessage(chatJid, {
        text: `❌ Invalid option. Use *on* or *off*.`
      }, { quoted: msg })
      return
    }

    const value = option === 'on'

    if (scope === 'private') {
      antiViewOncePrivate = value
      config.antiViewOncePrivate = value
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    👁️  ANTI VIEW ONCE   ║
╚════════════════════════╝

👤 *Private anti view once is now ${value ? '🟢 ON' : '🔴 OFF'}!*

${value
  ? 'View once media in private chats will be automatically revealed and resent.'
  : 'Private auto reveal has been disabled.'
}`
      }, { quoted: msg })

    } else if (scope === 'group') {
      antiViewOnceGroup = value
      config.antiViewOnceGroup = value
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    👁️  ANTI VIEW ONCE   ║
╚════════════════════════╝

👥 *Group anti view once is now ${value ? '🟢 ON' : '🔴 OFF'}!*

${value
  ? 'Anyone can reply to a view once message with *.vv* to reveal it in the group.'
  : 'Group reveal via .vv has been disabled.'
}`
      }, { quoted: msg })
    }
  }
}