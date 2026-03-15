export default {
  name: 'ping',
  ownerOnly: false,
  description: 'Check if Cypheron is alive',
  async execute(sock, chatJid, sender, msg) {

    // record the time before sending
    const start = Date.now()

    // send the message
    await sock.sendMessage(chatJid, {
      text: '🏓 Pong!',
      quoted: msg
    })

    // calculate how long it took
    const responseTime = Date.now() - start

    // send the response time as a follow up message
    await sock.sendMessage(chatJid, {
      text: `📶 *Response Time:* ${responseTime}ms\n⚡ *Status:* ${responseTime < 500 ? 'Excellent 🟢' : responseTime < 1000 ? 'Good 🟡' : 'Slow 🔴'}`,
      quoted: msg
    })

  }
}