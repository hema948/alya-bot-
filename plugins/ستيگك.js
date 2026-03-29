import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, args }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/webp/.test(mime)) {
    return m.reply(
`╭━━━〔 ⚠️ تنبيه 〕━━━╮
🌿 رد على ملصق فقط
╰━━━━━━━━━━━━━━━╯`)
  }

  await m.react('⏳')

  try {
    let img = await q.download?.()

    // 🔥 القيم الافتراضية
    let pack = '🌿 ⃝ 𝑨𝑳𝒀𝑨 - 𝑩𝑶𝑻'
    let author = '🍒 ⃝ 𝑩𝒀 𝑰𝑩𝑹𝑨𝑯𝑰𝑴'

    // ✨ لو المستخدم كتب اسم مخصص
    if (args.length) {
      let [customPack, ...customAuthor] = args.join(' ').split('|')
      if (customPack) pack = customPack.trim()
      if (customAuthor.length) author = customAuthor.join('|').trim()
    }

    const sticker = new Sticker(img, {
      type: 'full',
      pack,
      author,
      quality: 100
    })

    let buffer = await sticker.toBuffer()

    await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ فشل في سرقة الحقوق')
  }
}

handler.command = ['سرقه', 'سرق', 'steal']
handler.tags = ['sticker']
handler.help = ['سرقه (رد على ملصق)']

export default handler