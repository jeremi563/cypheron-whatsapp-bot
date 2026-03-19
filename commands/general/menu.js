import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import os from 'os'
import config from '../../config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'menu',
  ownerOnly: false,
  description: 'Show all available commands',
  async execute(sock, chatJid, sender, msg, commands) {

    const now = new Date()
    
    // ✅ Dynamic Greeting
    const hour = now.getHours()
    let greeting = 'Good evening 🌙'
    if (hour < 12) greeting = 'Good morning ☀️'
    else if (hour < 18) greeting = 'Good afternoon 🌤️'

    // ✅ Calculate Stats
    const uptimeInSeconds = process.uptime()
    const uptimeHours = Math.floor(uptimeInSeconds / 3600)
    const uptimeMinutes = Math.floor((uptimeInSeconds % 3600) / 60)
    const uptimeSeconds = Math.floor(uptimeInSeconds % 60)
    const uptimeString = `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`

    const ramUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2)
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) // in GB
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
      const list = cmds.map(cmd => ` ▹ ${cmd.name}`).join('\n')
      return `「 ${title} 」\n${list}\n`
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
`╭━━ [ 🤖 *CYPHERON BOT* ] ━━
┃
┃ ${greeting}, @${sender.replace('@s.whatsapp.net', '').replace('@lid', '')}!
┃ 📅 *Date:* ${date}
┃ 🕐 *Time:* ${time}
┃ ⚡ *Prefix:* [ ${config.prefix} ]
┃ ⏳ *Uptime:* ${uptimeString}
┃ 💾 *RAM:* ${ramUsage} MB / ${totalRam} GB
┃ 📊 *Commands:* ${totalCommands}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${generalSection}
${funSection}
${utilitySection}
${searchSection}
${mediaSection}
${groupSection}
${downloaderSection}
${ownerSection}
📢 *Channel:* wa.me/channel/0029VbCHhynLSmbdAmqOD438

*_Tap the image above to view our Source Code!_* 🐙

_Powered by Cypheron Bot 🤖_`

    const image = readFileSync(join(__dirname, '../../assets/bot.jpg'))

    // ✅ Send Main Menu Message (First)
    await sock.sendMessage(chatJid, {
      text: menuText,
      mentions: [sender],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "🤖 Cypheron Bot",
          body: `Uptime: ${uptimeString} | RAM: ${ramUsage}MB`,
          thumbnail: image,
          sourceUrl: "https://github.com/jeremi563/cypheron-whatsapp-bot",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: msg })

    // ✅ Send Welcome Audio (Voice Note) (Second)
    try {
      const audio = readFileSync(join(__dirname, '../../assets/welcome.mp3'))
      await sock.sendMessage(chatJid, {
        audio: audio,
        mimetype: 'audio/mp4',
        ptt: true
      }) // Not quoting the original msg here so it nicely follows the menu instead of stacking quotes
    } catch (e) {
      console.log('Welcome audio not found, skipping...')
    }

  }
}