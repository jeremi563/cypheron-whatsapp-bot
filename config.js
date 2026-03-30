import 'dotenv/config'

const config = {
  prefix: '!',
  botName: 'CYPHERON',
  owner: '254700581291@s.whatsapp.net',
  ownerLid: process.env.OWNER_LID || '186784386445322@lid',
  timezone: 'Africa/Nairobi',

  // ✅ bot features
  autoBio: true,
  autoViewStatus: true,
  autoLikeStatus: false,
  autoReplyStatus: false,
  autoReplyMessage: '👀 Status Seen by *CYPHERON* bot!',
  autoLikeEmoji: '❤️',
  autoReact: true,
  reactEmojis: ['❤️', '🔥', '👁️', '🤖', '👏', '🦴', '💯', '✨', '📌', '⚡'],

  // ✅ auto typing and recording
  autoTyping: false,
  autoRecording: false,

  // ✅ anti features
  antiViewOncePrivate: true,
  antiViewOnceGroup: true,
  antiDeletePrivate: true,
  antiDeleteGroup: true,
  antiCall: true,

  // ✅ group settings
  antilink: false,
  antispam: false,
  welcome: false,
  goodbye: true,

  // ✅ auto welcome time settings
  welcomeEnabled: true,
  welcomeStartHour: 22,
  welcomeEndHour: 6,
  welcomeCooldown: 30,

  // ✅ session ID loaded from .env
  sessionId: process.env.SESSION_ID || '',

  // ✅ search API keys
  gnewsApiKey: process.env.GNEWS_API_KEY || '',
  omdbApiKey: process.env.OMDB_API_KEY || '',

  // ✅ debug
  debugPresence: false,
}

export default config
