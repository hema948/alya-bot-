let handler = async (m, { conn, participants }) => {

  let who = m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.quoted 
    ? m.quoted.sender 
    : null

  if (!who) return m.reply('❌ منشن الشخص')

  let persen = Math.floor(Math.random() * 100) + 1

  let teks = `
╭━━━〔 💢 البعبصه 〕━━━╮

تم بعبصه ونيك طيزك @${who.split('@')[0]}!

📊 نسبة البعبصة: ${persen}%

${persen > 80 ? '💥 تم تفجير طيزك لأشلاء' : '💀 الوضع خطير'}

╰━━━━━━━━━━━━━━━╯
`

  conn.sendMessage(m.chat, {
    text: teks,
    mentions: [who]
  }, { quoted: m })
}

handler.command = ['بعبص']
handler.group = true

export default handler