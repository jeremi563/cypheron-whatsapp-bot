import config from '../../config.js'

const facts = [
  "A day on Venus is longer than a year on Venus. 🪐",
  "Honey never expires. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible. 🍯",
  "The human brain uses about 20% of the body's total energy. 🧠",
  "Octopuses have three hearts and blue blood. 🐙",
  "A group of flamingos is called a flamboyance. 🦩",
  "The Eiffel Tower can grow up to 6 inches taller in summer due to heat expansion. 🗼",
  "Sharks are older than trees. They have existed for over 400 million years. 🦈",
  "A bolt of lightning is five times hotter than the surface of the sun. ⚡",
  "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid. 🏛️",
  "The inventor of the Pringles can is buried in one. 🥫",
  "A snail can sleep for 3 years. 🐌",
  "Bananas are slightly radioactive. 🍌",
  "The shortest war in history lasted 38 to 45 minutes. ⚔️",
  "A cloud can weigh over a million pounds. ☁️",
  "Crows can recognize and remember human faces. 🐦",
]

export default {
  name: 'fact',
  ownerOnly: false,
  description: 'Get a random interesting fact',
  async execute(sock, chatJid, sender, msg) {
    const randomFact = facts[Math.floor(Math.random() * facts.length)]

    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║     🧠 RANDOM FACT      ║
╚════════════════════════╝

💡 ${randomFact}

_Type ${config.prefix}fact for another fact!_`
    }, { quoted: msg })
  }
}