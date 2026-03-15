import config from '../../config.js'

export default {
  name: 'weather',
  ownerOnly: false,
  description: 'Get weather for any city',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const city = text.slice(config.prefix.length + 'weather'.length).trim()

    if (!city) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a city name.

*Usage:* ${config.prefix}weather <city>
*Example:* ${config.prefix}weather Nairobi`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: `⏳ Fetching weather for *${city}*...`,
        quoted: msg
      })

      // step 1 — get coordinates from city name using wttr.in
      const geoResponse = await fetch(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1`
      )
      const geoData = await geoResponse.json()

      if (!geoData || !geoData.current_condition) {
        await sock.sendMessage(chatJid, {
          text: `❌ City *${city}* not found. Please check the spelling.`,
          quoted: msg
        })
        return
      }

      const current = geoData.current_condition[0]
      const nearest = geoData.nearest_area[0]
      const cityName = nearest.areaName[0].value
      const country = nearest.country[0].value

      const tempC = current.temp_C
      const tempF = current.temp_F
      const feelsLikeC = current.FeelsLikeC
      const humidity = current.humidity
      const windSpeed = current.windspeedKmph
      const visibility = current.visibility
      const description = current.weatherDesc[0].value
      const uvIndex = current.uvIndex

      // weather emoji based on description
      const getWeatherEmoji = (desc) => {
        const d = desc.toLowerCase()
        if (d.includes('sunny') || d.includes('clear')) return '☀️'
        if (d.includes('cloud')) return '☁️'
        if (d.includes('rain') || d.includes('drizzle')) return '🌧️'
        if (d.includes('storm') || d.includes('thunder')) return '⛈️'
        if (d.includes('snow')) return '❄️'
        if (d.includes('fog') || d.includes('mist')) return '🌫️'
        if (d.includes('wind')) return '💨'
        return '🌡️'
      }

      const emoji = getWeatherEmoji(description)

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║       🌍 WEATHER        ║
╚════════════════════════╝

📍 *${cityName}, ${country}*
${emoji} *${description}*

🌡️ *Temperature:* ${tempC}°C / ${tempF}°F
🤔 *Feels Like:* ${feelsLikeC}°C
💧 *Humidity:* ${humidity}%
💨 *Wind Speed:* ${windSpeed} km/h
👁️ *Visibility:* ${visibility} km
☀️ *UV Index:* ${uvIndex}

_Weather data powered by wttr.in_`,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to fetch weather: ${err.message}`,
        quoted: msg
      })
    }
  }
}