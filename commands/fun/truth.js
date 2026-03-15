import config from '../../config.js'

const truths = [
  "What is the most embarrassing thing you have ever done in public? 😳",
  "Have you ever lied to get out of trouble? What was the lie? 🤥",
  "What is your biggest fear? 😱",
  "Have you ever had a crush on a friend's partner? 💔",
  "What is the worst thing you have ever said about someone behind their back? 😬",
  "Have you ever cheated on a test or exam? 📝",
  "What is the most childish thing you still do? 🧸",
  "Have you ever blamed someone else for something you did? 😅",
  "What is the longest you have gone without showering? 🚿",
  "Have you ever stalked someone on social media? 📱",
  "What is the most embarrassing song on your playlist? 🎵",
  "Have you ever pretended to be sick to avoid something? 🤒",
  "What is a secret you have never told anyone? 🤫",
  "Have you ever broken something and blamed it on someone else? 💔",
  "What is the most ridiculous thing you have ever believed as a child? 👶",
  "Have you ever sent a message to the wrong person? 📨",
  "What is your most embarrassing nickname? 😂",
  "Have you ever eaten food that fell on the floor? 🍕",
  "What is the strangest dream you have ever had? 💭",
  "Have you ever laughed at the wrong moment? 😂",
]

export default {
  name: 'truth',
  ownerOnly: false,
  description: 'Get a random truth question',
  async execute(sock, chatJid, sender, msg) {
    const randomTruth = truths[Math.floor(Math.random() * truths.length)]
    const senderNumber = sender.replace('@s.whatsapp.net', '')

    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║     🎯 TRUTH TIME!      ║
╚════════════════════════╝

@${senderNumber} you must answer this honestly:

❓ ${randomTruth}

_No lies allowed! 😤_`,
      mentions: [sender],
      quoted: msg
    })
  }
}