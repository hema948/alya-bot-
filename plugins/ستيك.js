import fetch from 'node-fetch'
import { addExif } from '../lib/sticker.js'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    await m.react('⏳')

    if (/webp/g.test(mime)) {
      let img = await q.download?.()
      stiker = await addExif(img, '🌿 𝑨𝑳𝒀𝑨 - 𝑩𝑶𝑻', '🍒 𝑩𝒀 𝑰𝑩𝑹𝑨𝑯𝑰𝑴')
    } else if (/image/g.test(mime)) {
      let img = await q.download?.()
      stiker = await createSticker(img, false, '🌿 𝑨𝑳𝒀𝑨 - 𝑩𝑶𝑻', '🍒 𝑩𝒀 𝑰𝑩𝑹𝑨𝑯𝑰𝑴')
    } else if (/video/g.test(mime)) {
      if ((q.msg || q).seconds > 10) return m.reply(
`╭━━━〔 ⚠️ تنبيه 〕━━━╮
🌿 الفيديو طويل جداً
🍒 الحد الأقصى 7 ثواني
╰━━━━━━━━━━━━━━━╯`)
      let img = await q.download?.()
      stiker = await mp4ToWebp(img, { 
        pack: '🌿 𝑨𝑳𝒀𝑨 - 𝑩𝑶𝑻', 
        author: '🍒 𝑩𝒀 𝑰𝑩𝑹𝑨𝑯𝑰𝑴' 
      })
    } else if (args[0] && isUrl(args[0])) {
      stiker = await createSticker(false, args[0], '🌿 𝑨𝑳𝒀𝑨 - 𝑩𝑶𝑻', '🍒 𝑩𝒀 𝑰𝑩𝑹𝑨𝑯𝑰𝑴', 20)
    } else {
      await m.react('✍️')
      return m.reply(
`╭━━━〔 🌟 طريقة الاستخدام 〕━━━╮

✍️ قم بالرد على صورة أو فيديو

🍒 الأمر:
↤ ${usedPrefix + command}

╰━━━━━━━━━━━━━━━━━━━╯`)
    }
  } catch (e) {
    console.error(e)
    stiker = false
    await m.react('❌')
  } finally {
    if (stiker) {
      await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
      await m.react('✅')
    } else {
      m.reply(
`╭━━━〔 ❌ خطأ 〕━━━╮
🌿 تأكد من الوسائط
🍒 وحاول مرة أخرى
╰━━━━━━━━━━━━━━━╯`)
    }
  }
}

handler.help = ['ملصق']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'ملصق']

export default handler

// helpers
const isUrl = (text) => text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))

async function createSticker(img, url, packName, authorName, quality) {
  let stickerMetadata = { type: 'full', pack: packName, author: authorName, quality: 100 }
  return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
}

async function mp4ToWebp(file, stickerMetadata) {
  let getBase64 = file.toString('base64')
  const Format = {
    file: `data:video/mp4;base64,${getBase64}`,
    processOptions: { crop: false, startTime: '00:00:00.0', endTime: '00:00:7.0', loop: 0 },
    stickerMetadata: { ...stickerMetadata },
    sessionInfo: { WA_VERSION: '2.2106.5' },
    config: { sessionId: 'session', headless: true }
  }

  let res = await fetch('https://sticker-api.openwa.dev/convertMp4BufferToWebpDataUrl', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Format)
  })

  if (!res.ok) throw 'فشل التحويل'
  return Buffer.from((await res.text()).split(';base64,')[1], 'base64')
}