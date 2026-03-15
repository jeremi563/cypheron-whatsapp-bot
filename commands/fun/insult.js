import config from '../../config.js'

const insults = [
  "You are the human equivalent of a participation trophy. 🏆",
  "I would roast you but my mom told me not to burn trash. 🔥",
  "You are not stupid — you just have bad luck thinking. 🧠",
  "I have seen better heads on a pimple. 😂",
  "You are the reason they put instructions on shampoo. 🧴",
  "If brains were gasoline you would not have enough to power an ant's motorcycle. 🏍️",
  "You are proof that evolution can go in reverse. 🐒",
  "I would challenge you to a battle of wits but I see you are unarmed. ⚔️",
  "You are like a cloud — when you disappear it is a beautiful day. ☁️",
  "I would explain it to you but I do not have any crayons with me. 🖍️",
  "You are not the dumbest person in the world but you better hope they do not die. 💀",
  "I would insult your intelligence but there is not enough there to insult. 🤷",
  "You are like a software update — whenever I see you I think not now. 💻",
  "Your secrets are safe with me. I never pay attention when you talk. 😴",
  "I would agree with you but then we would both be wrong. 🤦",
]

export default {
  name: 'insult',
  ownerOnly: false,
  description: 'Send a playful insult',
  async execute(sock, chatJid, sender, msg) {
    const randomInsult = insults[Math.floor(Math.random() * insults.length)]

    // check if someone was mentioned
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    const target = mentionedJid || sender
    const targetNumber = target.replace('@s.whatsapp.net', '')

    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║    😈 PLAYFUL INSULT    ║
╚════════════════════════╝

Hey @${targetNumber}...

💬 ${randomInsult}

_Just kidding! 😂 All in good fun!_`,
      mentions: [target],
      quoted: msg
    })
  }
}