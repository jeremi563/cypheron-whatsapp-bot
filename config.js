import 'dotenv/config'

const config = {
  prefix: '!',
  botName: 'CYPHERON',
  owner: '254712345678@s.whatsapp.net',
  autoBio: true,

  // ✅ session ID now loaded from .env file — never hardcoded
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
}

export default config