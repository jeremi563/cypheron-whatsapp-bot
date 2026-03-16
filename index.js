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
import config from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers
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
        startBot()
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
        caption: `╔════════════════════════╗\n║       🤖 CYPHERON       ║\n╚════════════════════════╝\n\n✅ Cypheron is now connected and ready!\nType *${config.prefix}menu* to see all available commands.`
      })

      const audio = readFileSync(join(__dirname, './assets/startup.mp3'))

      await sock.sendMessage(botNumber, {
        audio: audio,
        mimetype: 'audio/mp4',
        ptt: false
      })

      log.info('Startup message and audio sent to your WhatsApp!')

      // auto start bio if enabled in config
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

        // ✅ handle status updates
        if (msg.key.remoteJid === 'status@broadcast') {
          if (msg.key.fromMe || !msg.message) continue

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

        // ✅ handle normal messages
        if (type !== 'notify') continue
        if (!msg.message) continue

        const chatJid = msg.key.remoteJid
        const isGroup = chatJid.endsWith('@g.us')
        const sender = isGroup ? msg.key.participant : chatJid

        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text || ''

        const body = text.trim()

        if (msg.key.fromMe && !body.startsWith(config.prefix)) continue

        log.info(`${isGroup ? '👥 Group' : '👤 Private'} | From: ${chalk.yellow(sender)}: ${chalk.white(body)}`)

        // ✅ auto typing and recording
        if (!msg.key.fromMe) {
          await sendTyping(sock, chatJid)
          await sendRecording(sock, chatJid)
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

_This is an automated message._`,
              quoted: msg
            })
            log.info(`Welcome message sent to ${chalk.yellow(sender)}`)
          }
        }

        // ✅ mark sender as active AFTER welcome check
        if (!msg.key.fromMe && !isGroup) {
          markSenderActive(sender)
        }

        // auto react
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
            log.success(`⚡ Auto reacted with ${randomEmoji} to message from ${chalk.yellow(sender)}`)
          } catch (err) {
            log.error(`Auto react error: ${err.message}`)
          }
        }

        if (!body.startsWith(config.prefix)) continue

        const commandName = body.slice(config.prefix.length).trim().toLowerCase()

        log.info(`Command received: ${chalk.bold(commandName)} from ${chalk.yellow(sender)}`)

        const command = commands.get(commandName)

        if (command) {

          if (command.ownerOnly && !isOwner(sender)) {
            await sock.sendMessage(chatJid, {
              text: `❌ *This command is for the bot owner only.*`,
              quoted: msg
            })
            log.warn(`Unauthorized use of owner command: ${commandName} by ${sender}`)
            continue
          }

          try {
            await command.execute(sock, chatJid, sender, msg, commands)
            log.success(`Executed command: ${chalk.bold(commandName)} for ${chalk.yellow(sender)}`)
          } catch (err) {
            log.error(`Failed to execute command: ${commandName} — ${err.message}`)
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
      if (err.message?.includes('Bad MAC') || err.message?.includes('decrypt')) return
      log.error(`Unexpected error: ${err.message}`)
    }
  })

  // ✅ group participants update
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      const groupMetadata = await sock.groupMetadata(id)

      if (action === 'add') {
        handleWelcome(sock, id, participants, groupMetadata)
        log.info(`👋 Welcome message sent in ${chalk.yellow(id)}`)
      } else if (action === 'remove' || action === 'leave') {
        handleGoodbye(sock, id, participants, groupMetadata)
        log.info(`👋 Goodbye message sent in ${chalk.yellow(id)}`)
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
        log.info(`📡 Presence — ${chalk.yellow(jid)}: ${chalk.bold(status)}`)
      }
    } catch (err) {
      log.error(`Presence update error: ${err.message}`)
    }
  })

}

process.on('uncaughtException', (err) => {
  if (err.message?.includes('Bad MAC') || err.message?.includes('decrypt')) return
  log.error(`Uncaught error: ${err.message}`)
})

process.on('unhandledRejection', (err) => {
  if (err?.message?.includes('Bad MAC') || err?.message?.includes('decrypt')) return
  log.error(`Unhandled rejection: ${err?.message}`)
})

// ✅ start keep-alive server ONCE outside startBot
startKeepAlive()

// ✅ start the bot
startBot()