import 'dotenv/config'

const config = {
  prefix: '!',
  botName: 'CYPHERON',
  owner: '254731242169@s.whatsapp.net',
  autoBio: true,

  // ✅ session ID loaded from .env
  sessionId: process.env.SESSION_ID || '',

  // auto status settings
  autoViewStatus: true,
  autoLikeStatus: true,
  autoReplyStatus: false,
  autoReplyMessage: '👀 Status Seen by *CYPHERON* bot!',
  autoLikeEmoji: '❤️',

  // auto react settings
  autoReact: true,
  reactEmojis: ['❤️', '🔥', '👁️', '🤖', '👏', '🦴', '💯', '✨', '📌', '⚡'],

  // group settings
  antilink: false,
  antispam: false,
  welcome: false,
  goodbye: true,

  // search API keys
gnewsApiKey: process.env.GNEWS_API_KEY || '',
omdbApiKey: process.env.OMDB_API_KEY || '',
}

export default config