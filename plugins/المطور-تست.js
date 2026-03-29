import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, participants, isOwner }) => {
  try {
    // 🔒 للمطوّر فقط
    if (!isOwner) {
      return m.reply(' 𝑫𝒂𝒛 𝒚𝒂 𝑨𝒃𝒅 🫦')
    }

    if (!m.isGroup) return m.reply('𝑭𝒐𝒓 𝑮𝒓𝒐𝒖𝒑𝒔 𝑶𝒏𝒍𝒚, 𝑫𝒆𝒗𝒔 🫦')

    const filePath = path.join(process.cwd(), 'test.json')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    if (data.status !== 'on') return

    // 🫦 رياكشن في الأول
    if (data.reaction?.status === 'on' && data.reaction.emoji) {
      await conn.sendMessage(m.chat, {
        react: {
          text: data.reaction.emoji,
          key: m.key
        }
      })
    }

    // 👥 منشن لكل أعضاء الجروب
    const mentions = participants.map(p => p.id)

    // 📩 رسالة مع منشن
    await conn.sendMessage(
      m.chat,
      {
        text: data.message,
        mentions
      },
      { quoted: m }
    )

  } catch (e) {
    await m.reply('❌ خطأ في ملف test.json')
  }
}

handler.help = ['test']
handler.tags = ['test']
handler.command = ['test', 'alive']

export default handler