export default {
  name: 'ping',
  ownerOnly: false,
  description: 'Check if Cypheron is alive',
  async execute(sock, chatJid, sender, msg) {

    const timestamp = Number(msg.messageTimestamp) * 1000
    let latency = Date.now() - timestamp

    if (latency < 0) latency = Math.abs(latency)

    const text = `╔════════════════════════╗
║     🤖 *CYPHERON PING*  ║
╚════════════════════════╝

🏓 *Pong!*
📶 *Latency:* ${latency}ms
⚡ *Network:* ${latency < 500 ? 'Excellent 🟢' : latency < 1000 ? 'Good 🟡' : 'Slow 🔴'}
🚀 *Host:* Cypheron Engine`

    await sock.sendMessage(chatJid, {
      text,
      quoted: msg
    })

  }
}