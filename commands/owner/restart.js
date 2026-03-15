import config from '../../config.js'

export default {
  name: 'restart',
  ownerOnly: true,
  description: 'Restart the bot',
  async execute(sock, chatJid, sender, msg) {
    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║       🔄 RESTART        ║
╚════════════════════════╝

⏳ Cypheron is restarting...
Please wait a few seconds.

_Bot will be back shortly!_`,
      quoted: msg
    })

    // wait for message to send then restart
    setTimeout(() => {
      process.exit(0)
    }, 3000)
  }
}