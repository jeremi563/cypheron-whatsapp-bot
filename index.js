import 'dotenv/config'
import pkg from 'gifted-baileys'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import qrcode2 from 'qrcode'
import chalk from 'chalk'
import ora from 'ora'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadCommands, isOwner } from './handler.js'
import { shouldWelcome, markSenderActive } from './cooldown.js'
import { updatePresence } from './presence.js'
import { startServer, sendQR, sendPairCode, sendConnected, sendStatus, sendError, serverState } from './server.js'
import { decodeSession, hasValidSession } from './session.js'
import { handleWelcome } from './commands/group/welcome.js'
import { handleGoodbye } from './commands/group/goodbye.js'
import { checkAntiLink } from './commands/group/antilink.js'
import { checkAntiSpam } from './commands/group/antispam.js'
import { sendTyping } from './commands/owner/autotyping.js'
import { sendRecording } from './commands/owner/autorecording.js'
import { startKeepAlive } from './server-keep-alive.js'
import { isAntiViewOncePrivateEnabled } from './commands/owner/antiviewonce.js'
import config from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  downloadMediaMessage
} = pkg

const log = {
  info: (msg) => console.log(chalk.cyan('ℹ️  ' + msg)),
  success: (msg) => console.log(chalk.green('✅ ' + msg)),
  error: (msg) => console.log(chalk.red('❌ ' + msg)),
  warn: (msg) => console.log(chalk.yellow('⚠️  ' + msg)),
  qr: (msg) => console.log(chalk.magenta('📱 ' + msg)),
  reconnect: (msg) => console.log(chalk.blue('🔄 ' + msg)),
}

let globalMethod = 'qr'
let globalPhone = null
let serverStarted = false

// ✅ prevent duplicate message processing
const processedMessages = new Set()

// ✅ message cache for anti-delete
const messageStore = new Map()
const MAX_STORE_SIZE = 500

async function startBot() {

  // ✅ decode session if provided
  if (hasValidSession(config.sessionId)) {
    log.info('Session ID found in config — loading session...')
    const decoded = decodeSession(config.sessionId, './auth_info')
    if (decoded) {
      log.success('Session loaded successfully from Session ID!')
    } else {
      log.error('Failed to load session from Session ID. Please get a new one.')
      process.exit(1)
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

  const { version } = await fetchLatestBaileysVersion()
  log.info(`Using WA version: ${chalk.bold(version.join('.'))}`)

  const commands = await loadCommands()

  // ✅ only start web server once
  if (!hasValidSession(config.sessionId) && !serverStarted) {
    serverStarted = true
    log.info('No session ID found — starting web panel...')
    const result = await startServer()
    globalMethod = result.method
    globalPhone = result.phone
    log.info(`Connection method: ${chalk.bold(globalMethod)}`)
    if (globalPhone) log.info(`Phone number: ${chalk.bold(globalPhone)}`)
  }

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: globalMethod === 'pair'
      ? Browsers.macOS('Chrome')
      : Browsers.ubuntu('MyBot'),
    markOnlineOnConnect: false,
    printQRInTerminal: false,
    defaultQueryTimeoutMs: globalMethod === 'pair' ? undefined : 30000,
  })

  sock.ev.on('creds.update', saveCreds)

  const spinner = ora({
    text: chalk.cyan('Connecting to WhatsApp...'),
    spinner: 'dots12',
    color: 'cyan'
  }).start()

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {

    // ✅ request pairing code when QR fires
    if (qr && globalMethod === 'pair' && globalPhone) {
      if (!sock.authState.creds.registered && !serverState.pairingCodeRequested) {
        try {
          serverState.pairingCodeRequested = true
          await new Promise(resolve => setTimeout(resolve, 3000))
          const cleanPhone = globalPhone.replace(/[^0-9]/g, '')
          const code = await sock.requestPairingCode(cleanPhone)
          sendPairCode(code)
          sendStatus('ENTER CODE IN WHATSAPP')
          log.info(`Pairing code sent to web panel: ${chalk.bold(code)}`)
        } catch (err) {
          serverState.pairingCodeRequested = false
          sendError(`Failed to generate pairing code: ${err.message}`)
          log.error(`Pairing code error: ${err.message}`)
        }
      }
      return
    }

    // ✅ send QR to web panel
    if (qr && globalMethod === 'qr' && !hasValidSession(config.sessionId)) {
      try {
        const qrImage = await qrcode2.toDataURL(qr)
        sendQR(qrImage)
        sendStatus('SCAN QR CODE TO CONNECT')
        log.info('QR code sent to web panel')
      } catch (err) {
        log.error(`QR generation error: ${err.message}`)
      }
    }

    if (connection === 'close') {
      spinner.stop()

      if (!hasValidSession(config.sessionId)) {
        sendStatus('CONNECTION LOST — RECONNECTING')
      }

      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut

      if (shouldReconnect) {
        log.reconnect('Connection lost. Reconnecting...')
        serverState.pairingCodeRequested = false
        setTimeout(() => startBot(), 5000)
      } else {
        log.error('Logged out. Delete the auth_info folder and restart.')
        if (!hasValidSession(config.sessionId)) {
          sendStatus('LOGGED OUT — RESTART BOT')
        }
      }

    } else if (connection === 'connecting') {
      if (!hasValidSession(config.sessionId)) {
        sendStatus('CONNECTING TO WHATSAPP')
      }
      spinner.text = chalk.cyan('Connecting to WhatsApp...')
      spinner.start()

    } else if (connection === 'open') {
      if (!hasValidSession(config.sessionId)) {
        sendConnected()
        sendStatus('BOT ONLINE')
      }

      spinner.succeed(chalk.green('CYPHERON Bot connected successfully!'))
      log.success('Bot is live and ready to receive messages!')
      console.log(chalk.gray('─────────────────────────────────'))

      const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const image = readFileSync(join(__dirname, './assets/bot.jpg'))

      await sock.sendMessage(botNumber, {
        image: image,
        caption:
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

✅ Cypheron is now connected and ready!
Type *${config.prefix}menu* to see all available commands.`
      })

      const audio = readFileSync(join(__dirname, './assets/startup.mp3'))

      await sock.sendMessage(botNumber, {
        audio: audio,
        mimetype: 'audio/mp4',
        ptt: false
      })

      log.info('Startup message and audio sent to your WhatsApp!')

      // ✅ auto start bio if enabled in config
      if (config.autoBio) {
        const { startAutoBio } = await import('./commands/owner/autobio.js')
        startAutoBio(sock)
        log.info('Auto bio started automatically!')
      }

    }

  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    try {

      for (const msg of messages) {

        if (!msg.message) continue

        // ✅ store message in cache
        if (msg.key && msg.key.id) {
          messageStore.set(msg.key.id, msg)
          if (messageStore.size > MAX_STORE_SIZE) {
            const firstKey = messageStore.keys().next().value
            messageStore.delete(firstKey)
          }
        }

        // ✅ prevent duplicate message processing
        if (processedMessages.has(msg.key.id)) continue
        processedMessages.add(msg.key.id)

        const chatJid = msg.key.remoteJid
        if (!chatJid) continue

        // ✅ handle status updates separately
        if (chatJid === 'status@broadcast') {
          if (msg.key.fromMe) continue

          const statusPoster = msg.key.participant || msg.key.remoteJid
          log.info(`📺 Status from: ${chalk.yellow(statusPoster)}`)

          if (config.autoViewStatus) {
            try {
              await sock.readMessages([msg.key])
              log.success(`👁️ Auto viewed status from ${chalk.yellow(statusPoster)}`)
            } catch (err) {
              log.error(`Auto view error: ${err.message}`)
            }
          }

          if (config.autoLikeStatus) {
            try {
              await sock.sendMessage(statusPoster, {
                react: {
                  text: config.autoLikeEmoji,
                  key: msg.key
                }
              })
              log.success(`❤️ Auto liked status from ${chalk.yellow(statusPoster)}`)
            } catch (err) {
              log.error(`Auto like error: ${err.message}`)
            }
          }

          if (config.autoReplyStatus) {
            try {
              await sock.sendMessage(statusPoster, {
                text: config.autoReplyMessage,
                quoted: msg
              })
              log.success(`💬 Auto replied to status from ${chalk.yellow(statusPoster)}`)
            } catch (err) {
              log.error(`Auto reply error: ${err.message}`)
            }
          }

          continue
        }

        const isGroup = chatJid.endsWith('@g.us')
        const sender = isGroup
          ? (msg.key.participant || chatJid)
          : (msg.key.fromMe ? (sock.user.id.split(':')[0] + '@s.whatsapp.net') : chatJid)

        // ✅ check for message revocation (anti-delete)
        if (msg.message?.protocolMessage?.type === 0) {
          const deletedKey = msg.message.protocolMessage.key
          if (deletedKey && deletedKey.id) {
            const originalMsg = messageStore.get(deletedKey.id)
            if (originalMsg) {
              const deleter = msg.key.participant || msg.key.remoteJid
              if ((!isGroup && config.antiDeletePrivate) || (isGroup && config.antiDeleteGroup)) {
                const senderNumber = deleter.replace('@s.whatsapp.net', '').replace('@lid', '')
                const header = `╔════════════════════════╗\n║    🚫 *ANTI-DELETE* 🚫\n╚════════════════════════╝\n\n👤 *From:* @${senderNumber}\n`
                const footer = `\n\n📢 *Channel:* wa.me/channel/0029VbCHhynLSmbdAmqOD438`

                const textContent = originalMsg.message?.conversation || originalMsg.message?.extendedTextMessage?.text || ''
                const isMedia = originalMsg.message?.imageMessage || originalMsg.message?.videoMessage || originalMsg.message?.audioMessage || originalMsg.message?.documentMessage || originalMsg.message?.stickerMessage
                const isViewOnce = originalMsg.message?.viewOnceMessage || originalMsg.message?.viewOnceMessageV2 || originalMsg.message?.viewOnceMessageV2Extension

                if (textContent && !isMedia && !isViewOnce) {
                  const finalMsg = `${header}💬 *Message:*\n${textContent}${footer}`
                  await sock.sendMessage(chatJid, { text: finalMsg, mentions: [deleter] })
                  log.info(`Recovered deleted TEXT message from ${chalk.yellow(deleter)}`)
                } else {
                  try {
                    const buffer = await downloadMediaMessage(
                      originalMsg,
                      'buffer',
                      {},
                      { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
                    )

                    const actualObj = originalMsg.message?.viewOnceMessage?.message || originalMsg.message?.viewOnceMessageV2?.message || originalMsg.message?.viewOnceMessageV2Extension?.message || originalMsg.message
                    const mediaMsg = actualObj?.imageMessage || actualObj?.videoMessage || actualObj?.documentMessage

                    const captionContent = mediaMsg?.caption ? `\n📝 *Caption:*\n${mediaMsg.caption}` : ''
                    const finalCaption = `${header}${captionContent}${footer}`

                    if (actualObj?.imageMessage) {
                      await sock.sendMessage(chatJid, { image: buffer, caption: finalCaption, mentions: [deleter] })
                    } else if (actualObj?.videoMessage) {
                      await sock.sendMessage(chatJid, { video: buffer, caption: finalCaption, mentions: [deleter] })
                    } else if (actualObj?.documentMessage) {
                      await sock.sendMessage(chatJid, { document: buffer, caption: finalCaption, mimetype: actualObj.documentMessage.mimetype, fileName: actualObj.documentMessage.fileName || 'Deleted_Document', mentions: [deleter] })
                    } else {
                      await sock.sendMessage(chatJid, { text: `${header}⚠️ *Note:* Media recovered below (cannot contain caption).${footer}`, mentions: [deleter] })
                      if (actualObj?.audioMessage) await sock.sendMessage(chatJid, { audio: buffer, mimetype: 'audio/mp4', ptt: actualObj.audioMessage.ptt })
                      if (actualObj?.stickerMessage) await sock.sendMessage(chatJid, { sticker: buffer })
                    }
                    log.info(`Recovered deleted MEDIA message from ${chalk.yellow(deleter)}`)
                  } catch (e) {
                    await sock.sendMessage(chatJid, { text: `${header}⚠️ *Note:* Media download failed. Forwarding encrypted payload...${footer}`, mentions: [deleter] })
                    await sock.sendMessage(chatJid, { forward: originalMsg })
                  }
                }
              }
            }
          }
          continue
        }

        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          msg.message?.videoMessage?.caption || ''

        const body = text.trim()

        // ✅ ignore very long messages
        if (body.length > 2000) continue

        // ✅ ignore self messages that dont start with prefix
        if (msg.key.fromMe && !body.startsWith(config.prefix)) continue

        log.info(`${isGroup ? '👥 Group' : '👤 Private'} | From: ${chalk.yellow(sender)}: ${chalk.white(body)}`)

        // ✅ auto typing and recording
        if (!msg.key.fromMe) {
          await sendTyping(sock, chatJid)
          await sendRecording(sock, chatJid)
        }

        // ✅ anti view once — private auto reveal
        if (!isGroup && !msg.key.fromMe && isAntiViewOncePrivateEnabled()) {

          // ✅ detect which view once container is present
          const viewOnceContainer =
            msg.message?.viewOnceMessage ||
            msg.message?.viewOnceMessageV2 ||
            msg.message?.viewOnceMessageV2Extension

          const viewOnceMsg = viewOnceContainer?.message

          if (viewOnceMsg) {
            try {
              const mediaMsg =
                viewOnceMsg.imageMessage ||
                viewOnceMsg.videoMessage ||
                viewOnceMsg.audioMessage

              if (mediaMsg) {
                // ✅ remove viewOnce flag before downloading
                mediaMsg.viewOnce = false

                // ✅ reconstruct message for correct downloading
                const targetMsg = {
                  key: msg.key,
                  message: msg.message
                }

                const buffer = await downloadMediaMessage(
                  targetMsg,
                  'buffer',
                  {},
                  {
                    logger: pino({ level: 'silent' }),
                    reuploadRequest: sock.updateMediaMessage
                  }
                )

                if (viewOnceMsg.imageMessage) {
                  await sock.sendMessage(chatJid, {
                    image: buffer,
                    caption: `👁️ *View Once saved!*`
                  })
                } else if (viewOnceMsg.videoMessage) {
                  await sock.sendMessage(chatJid, {
                    video: buffer,
                    caption: `👁️ *View Once saved!*`
                  })
                } else if (viewOnceMsg.audioMessage) {
                  await sock.sendMessage(chatJid, {
                    audio: buffer,
                    mimetype: 'audio/mp4',
                    ptt: viewOnceMsg.audioMessage.ptt || false
                  })
                }

                log.success(`👁️ Anti view once revealed from ${chalk.yellow(sender)}`)
              }
            } catch (err) {
              log.error(`Anti view once error: ${err.message}`)
            }
          }
        }

        // ✅ antilink and antispam checks
        if (isGroup && !msg.key.fromMe) {
          await checkAntiLink(sock, msg, chatJid, sender)
          await checkAntiSpam(sock, msg, chatJid, sender)
        }

        // ✅ auto welcome logic — check BEFORE marking active
        if (!isGroup && !isOwner(sender) && !msg.key.fromMe) {
          if (shouldWelcome(sender)) {
            await sock.sendMessage(chatJid, {
              text:
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

👋 *Welcome!*

Hey there! I am *Cypheron*, an automated WhatsApp bot.

The owner is currently unavailable but your message has been received.

Type *${config.prefix}menu* to see what I can do for you!

_This is an automated message._`
            }, { quoted: msg })
            log.info(`Welcome message sent to ${chalk.yellow(sender)}`)
          }
        }

        // ✅ mark sender as active AFTER welcome check
        if (!msg.key.fromMe && !isGroup) {
          markSenderActive(sender)
        }

        // ✅ auto react to private messages
        if (!isGroup && !msg.key.fromMe && config.autoReact) {
          try {
            const randomEmoji = config.reactEmojis[
              Math.floor(Math.random() * config.reactEmojis.length)
            ]
            await sock.sendMessage(chatJid, {
              react: {
                text: randomEmoji,
                key: msg.key
              }
            })
            log.success(`⚡ Auto reacted with ${randomEmoji} to ${chalk.yellow(sender)}`)
          } catch (err) {
            log.error(`Auto react error: ${err.message}`)
          }
        }

        // ✅ handle .vv command with dot prefix — groups only
        if (isGroup && body.toLowerCase() === '.vv') {
          const vvCommand = commands.get('vv')
          if (vvCommand) {
            try {
              await vvCommand.execute(sock, chatJid, sender, msg, commands, [])
              log.success(`Executed: vv for ${chalk.yellow(sender)}`)
            } catch (err) {
              log.error(`vv command error: ${err.message}`)
            }
          }
          continue
        }

        // ✅ ignore messages that dont start with prefix
        if (!body.startsWith(config.prefix)) continue

        // ✅ extract command name and args
        const args = body.slice(config.prefix.length).trim().split(/ +/)
        const commandName = args.shift()?.toLowerCase()

        if (!commandName) continue

        log.info(`Command received: ${chalk.bold(commandName)} from ${chalk.yellow(sender)}`)

        const command = commands.get(commandName)

        if (command) {

          // ✅ check owner only
          if (command.ownerOnly && !isOwner(sender)) {
            await sock.sendMessage(chatJid, {
              text: `❌ *This command is for the bot owner only.*`,
              quoted: msg
            })
            log.warn(`Unauthorized: ${commandName} by ${sender}`)
            continue
          }

          try {
            await command.execute(sock, chatJid, sender, msg, commands, args)
            log.success(`Executed: ${chalk.bold(commandName)} for ${chalk.yellow(sender)}`)
          } catch (err) {
            log.error(`Command error ${commandName}: ${err.message}`)
            await sock.sendMessage(chatJid, {
              text: '❌ Something went wrong running that command.',
              quoted: msg
            })
          }

        } else {
          await sock.sendMessage(chatJid, {
            text: `❌ Unknown command *${config.prefix}${commandName}*\n\nType *${config.prefix}menu* to see all available commands.`,
            quoted: msg
          })
        }

      }

    } catch (err) {
      if (err?.message?.includes('Bad MAC') || err?.message?.includes('decrypt')) return
      log.error(`Unexpected error: ${err?.message || err}`)
    }
  })

  // ✅ group participants update
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      const groupMetadata = await sock.groupMetadata(id)

      if (action === 'add') {
        handleWelcome(sock, id, participants, groupMetadata)
        log.info(`👋 Welcome sent in ${chalk.yellow(id)}`)
      }

      if (action === 'remove' || action === 'leave') {
        handleGoodbye(sock, id, participants, groupMetadata)
        log.info(`👋 Goodbye sent in ${chalk.yellow(id)}`)
      }

    } catch (err) {
      log.error(`Group participants update error: ${err.message}`)
    }
  })

  // ✅ presence updates
  sock.ev.on('presence.update', ({ id, presences }) => {
    try {
      for (const [participant, presence] of Object.entries(presences)) {
        const jid = id || participant
        const status = presence.lastKnownPresence
        updatePresence(jid, status)
        if (config.debugPresence) {
          log.info(`📡 Presence — ${chalk.yellow(jid)}: ${chalk.bold(status)}`)
        }
      }
    } catch (err) {
      log.error(`Presence update error: ${err.message}`)
    }
  })

}

process.on('uncaughtException', (err) => {
  if (err?.message?.includes('Bad MAC') || err?.message?.includes('decrypt')) return
  log.error(`Uncaught error: ${err?.message || err}`)
})

process.on('unhandledRejection', (err) => {
  if (err?.message?.includes('Bad MAC') || err?.message?.includes('decrypt')) return
  log.error(`Unhandled rejection: ${err?.message || err}`)
})

// ✅ start keep-alive server ONCE outside startBot
startKeepAlive()

// ✅ start the bot
startBot()