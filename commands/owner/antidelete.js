import config from '../../config.js'

let antiDeleteGroup = config.antiDeleteGroup

export function isAntiDeleteGroupEnabled() {
  return antiDeleteGroup
}

export default {
  name: 'antidelete',
  ownerOnly: true,
  description: 'Toggle anti delete for group chats',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const scope = args[0]?.toLowerCase()
    const option = args[1]?.toLowerCase()

    if (!scope || !option) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     🚫  ANTI DELETE    ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}antidelete group on/off

*Current Status:*
👤 *Private:* 🟢 ON (Always)
👥 *Group:* ${antiDeleteGroup ? '🟢 ON' : '🔴 OFF'}

*How it works:*
Any deleted message will be instantly recovered and sent back to the chat.`
      }, { quoted: msg })
      return
    }

    if (scope !== 'group') {
      await sock.sendMessage(chatJid, {
        text: `❌ Invalid scope. Use *group* (Private is always on).`
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
    
    antiDeleteGroup = value
    config.antiDeleteGroup = value
    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║     🚫  ANTI DELETE    ║
╚════════════════════════╝

👥 *Group anti delete is now ${value ? '🟢 ON' : '🔴 OFF'}!*

${value
  ? 'Deleted messages in groups will now be automatically recovered and forwarded back.'
  : 'Group message recovery disabled.'
}`
    }, { quoted: msg })
  }
}
