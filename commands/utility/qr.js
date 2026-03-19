import QRCode from 'qrcode'
import config from '../../config.js'

export default {
  name: 'qr',
  ownerOnly: false,
  description: 'Generate a QR code from text or URL',
  async execute(sock, chatJid, sender, msg, commands, args) {
    const content = args.join(' ')

    if (!content) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide text or URL.

*Usage:* ${config.prefix}qr <text or url>
*Example:* ${config.prefix}qr Hello World`
      }, { quoted: msg })
      return
    }

    try {
      const qrBuffer = await QRCode.toBuffer(content, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 512,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      })

      await sock.sendMessage(chatJid, {
        image: qrBuffer,
        caption:
`✅ *QR Code Generated!*

📝 *Content:*
${content}

_Scan with any QR code reader_`
      }, { quoted: msg })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to generate QR code: ${err.message}`
      }, { quoted: msg })
    }
  }
}