import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import FormData from "form-data"

// رفع الفيديو على Catbox
async function uploadToCatbox(content, filename) {
  const form = new FormData()
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", content, filename)

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form
  })

  const text = await res.text()
  if (!text || !text.startsWith("https://")) throw new Error("❌ خطأ أثناء رفع الفيديو إلى Catbox.")
  return text
}

const handler = async (m, { conn, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, "")
  const botPath = path.join("./Sessions/SubBot", senderNumber)
  const configPath = path.join(botPath, "config.json")

  // التأكد أنه سوكيت
  if (!fs.existsSync(botPath)) 
    return m.reply("> ✧ هذا الأمر مخصص فقط للسوكيت (Sub-Bot).")

  try {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || q.mediaType || ""

    // التحقق من الفيديو
    if (!mime || !/video\/(mp4|mkv|mov)/.test(mime)) {
      return conn.sendMessage(m.chat, {
        text: `❐ من فضلك رد على 🎞️ فيديو صحيح (MP4 / MKV / MOV) باستخدام *.${command}*`,
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: "🕓", key: m.key } })

    // تحميل الفيديو
    const media = await q.download()
    if (!media) throw new Error("❌ فشل تحميل الفيديو.")

    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${mime.split("/")[1]}`
    
    // رفع الفيديو
    const uploadUrl = await uploadToCatbox(media, filename)

    // حفظ الرابط في config
    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.video = uploadUrl
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    await conn.sendMessage(m.chat, {
      text: `✩︎ تم تحديث الفيديو بنجاح:\n${uploadUrl}`,
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, {
      text: "❌ فشل رفع الفيديو، حاول مرة أخرى لاحقاً.",
    }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: "✖️", key: m.key } })
  }
}

// أوامر التنفيذ
handler.command = ["setvid"]
handler.help = ["setvid"]
handler.tags = ["serbot"]

export default handler