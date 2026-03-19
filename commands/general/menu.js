import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import config from '../../config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'menu',
  ownerOnly: false,
  description: 'Show all available commands',
  async execute(sock, chatJid, sender, msg, commands) {

    const now = new Date()
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: config.timezone
    })
    const date = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: config.timezone
    })

    // ✅ organize commands by category
    const categories = {
      '🌍 General': [],
      '👑 Owner': [],
      '🎮 Fun': [],
      '🔧 Utility': [],
      '🔍 Search': [],
      '🎵 Media': [],
      '👥 Group': [],
      '⬇️ Downloader': [],
    }

    // ✅ map command names to their categories
    const categoryMap = {
      // general
      menu: '🌍 General',
      ping: '🌍 General',
      hello: '🌍 General',
      time: '🌍 General',
      date: '🌍 General',
      info: '🌍 General',
      about: '🌍 General',
      runtime: '🌍 General',
      uptime: '🌍 General',
      owner: '🌍 General',
      rules: '🌍 General',
      support: '🌍 General',
      whoami: '🌍 General',

      // owner
      autobio: '👑 Owner',
      autoreact: '👑 Owner',
      autostatus: '👑 Owner',
      autotyping: '👑 Owner',
      autorecording: '👑 Owner',
      autowelcome: '👑 Owner',
      antiviewonce: '👑 Owner',
      block: '👑 Owner',
      unblock: '👑 Owner',
      eval: '👑 Owner',
      setprefix: '👑 Owner',
      track: '👑 Owner',
      typing: '👑 Owner',
      recording: '👑 Owner',
      restart: '👑 Owner',
      shutdown: '👑 Owner',
      getid: '👑 Owner',

      // fun
      fact: '🎮 Fun',
      truth: '🎮 Fun',
      insult: '🎮 Fun',
      ship: '🎮 Fun',
      meme: '🎮 Fun',

      // utility
      password: '🔧 Utility',
      calculate: '🔧 Utility',
      qr: '🔧 Utility',
      base64: '🔧 Utility',
      shortlink: '🔧 Utility',

      // search
      weather: '🔍 Search',
      news: '🔍 Search',
      github: '🔍 Search',
      movie: '🔍 Search',
      lyrics: '🔍 Search',

      // media
      sticker: '🎵 Media',
      toimg: '🎵 Media',
      tomp3: '🎵 Media',
      tovideo: '🎵 Media',
      tts: '🎵 Media',

      // group
      groupinfo: '👥 Group',
      setname: '👥 Group',
      setdesc: '👥 Group',
      revoke: '👥 Group',
      welcome: '👥 Group',
      goodbye: '👥 Group',
      antilink: '👥 Group',
      antispam: '👥 Group',
      vv: '👥 Group',

      // downloader
      tiktok: '⬇️ Downloader',
      yt: '⬇️ Downloader',
      instagram: '⬇️ Downloader',
      facebook: '⬇️ Downloader',
      twitter: '⬇️ Downloader',
    }

    // ✅ fill categories with commands
    for (const [name, command] of commands) {
      const category = categoryMap[name]
      if (category && categories[category] !== undefined) {
        categories[category].push({ name, description: command.description })
      }
    }

    // ✅ build each category section
    const buildSection = (title, cmds) => {
      if (cmds.length === 0) return ''
      const list = cmds.map(cmd => `│  ➤ ${cmd.name}`).join('\n')
      return `╔══════════════════════════╗\n║ ${title.padEnd(25)}║\n╠══════════════════════════╣\n${list}\n╚══════════════════════════╝\n`
    }

    const generalSection = buildSection('🌍 GENERAL', categories['🌍 General'])
    const ownerSection = buildSection('👑 OWNER ONLY', categories['👑 Owner'])
    const funSection = buildSection('🎮 FUN', categories['🎮 Fun'])
    const utilitySection = buildSection('🔧 UTILITY', categories['🔧 Utility'])
    const searchSection = buildSection('🔍 SEARCH', categories['🔍 Search'])
    const mediaSection = buildSection('🎵 MEDIA', categories['🎵 Media'])
    const groupSection = buildSection('👥 GROUP', categories['👥 Group'])
    const downloaderSection = buildSection('⬇️ DOWNLOADER', categories['⬇️ Downloader'])

    const totalCommands = commands.size

    const menuText =
`╔══════════════════════════╗
║   🤖 CYPHERON BOT MENU   ║
╚══════════════════════════╝

👤 *User:* @${sender.replace('@s.whatsapp.net', '').replace('@lid', '')}
📅 *Date:* ${date}
🕐 *Time:* ${time}
⚡ *Prefix:* ${config.prefix}
📊 *Commands:* ${totalCommands}

_Type ${config.prefix}<command> to use_
_Example: ${config.prefix}ping_

━━━━━━━━━━━━━━━━━━━━━━━━━━━

${generalSection}
${funSection}
${utilitySection}
${searchSection}
${mediaSection}
${groupSection}
${downloaderSection}
${ownerSection}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *Channel:*
https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438

🐙 *GitHub:*
https://github.com/jeremi563/cypheron-whatsapp-bot

_Powered by Cypheron Bot 🤖_`

    const image = readFileSync(join(__dirname, '../../assets/bot.jpg'))

    await sock.sendMessage(chatJid, {
      image: image,
      caption: menuText,
      mentions: [sender]
    }, { quoted: msg })

  }
}