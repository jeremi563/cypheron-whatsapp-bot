import gtts from 'gtts'
import { unlinkSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import config from '../../config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'tts',
  ownerOnly: false,
  description: 'Convert text to speech',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    // extract text after the command
    const textToSpeak = text.slice(config.prefix.length + 'tts'.length).trim()

    if (!textToSpeak) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide text to convert.

*Usage:* ${config.prefix}tts <text>
*Example:* ${config.prefix}tts Hello world!`,
        quoted: msg
      })
      return
    }

    if (textToSpeak.length > 200) {
      await sock.sendMessage(chatJid, {
        text: '❌ Text is too long. Maximum 200 characters.',
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Converting text to speech...',
        quoted: msg
      })

      const tempAudio = join(__dirname, `../../temp_tts_${Date.now()}.mp3`)

      // generate speech
      await new Promise((resolve, reject) => {
        const speech = new gtts(textToSpeak, 'en')
        speech.save(tempAudio, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      const { readFileSync } = await import('fs')
      const audioBuffer = readFileSync(tempAudio)

      await sock.sendMessage(chatJid, {
        audio: audioBuffer,
        mimetype: 'audio/mp4',
        ptt: true, // send as voice note
        quoted: msg
      })

      if (existsSync(tempAudio)) unlinkSync(tempAudio)

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to convert text to speech: ${err.message}`,
        quoted: msg
      })
    }
  }
}
