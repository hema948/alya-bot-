import yts from "yt-search"
import fetch from "node-fetch"

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply("🎶 *ادخل اسم الاغنية بعد الأمر يا غبي*.")

  await m.react("🕘")

  try {
    let url = text
    let title = "مجهول"
    let authorName = "مجهول"
    let durationTimestamp = "مجهول"
    let views = "مجهول"
    let thumbnail = ""

    if (!text.startsWith("https://")) {
      const res = await yts(text)
      if (!res?.videos?.length) return m.reply("🚫 *لم اجد اي معلومات للاغنية حاول البحث بنص آخر*.")
      const video = res.videos[0]
      title = video.title
      authorName = video.author?.name
      durationTimestamp = video.timestamp
      views = video.views
      url = video.url
      thumbnail = video.thumbnail
    }

    const vistas = formatViews(views)

    const res3 = await fetch("https://files.catbox.moe/wfd0ze.jpg")
    const thumb3 = Buffer.from(await res3.arrayBuffer())

    const fkontak = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        locationMessage: {
          name: `『 ${title} 』`,
          jpegThumbnail: thumb3
        }
      }
    }

    const caption = `
✧━───『 *معلومات الاغنية* 』───━✧

🎼 *العنوان*: ${title}
📺 *القناة/المؤلف*: ${authorName}
👁️ *المشاهدات*: ${vistas}
⏳ *المدة*: ${durationTimestamp}
🌐 *الرابط*: ${url}

✧━───『 𝚊𝚕𝚢𝚜 𝙱𝚘𝚝 』───━✧

* 𝑃𝛩𝑊𝐸𝑅𝐸𝐷 𝐵𝑌 : ℎ 𝑒 𝑚 𝑎
`

    const thumb = (await conn.getFile(thumbnail)).data

    await conn.sendMessage(
      m.chat,
      {
        image: thumb,
        caption,
        footer: "⚡ 𝚊𝚕𝚢𝚊 𝙱𝚘𝚝 — *For fast download* ⚡",
        headerType: 4
      },
      { quoted: fkontak }
    )

    await downloadMedia(conn, m, url, fkontak)

    await m.react("✅")
  } catch (e) {
    m.reply("❌ خطأ: " + e.message)
    m.react("⚠️")
  }
}

const fetchBuffer = async (url) => {
  const response = await fetch(url)
  return await response.buffer()
}

const downloadMedia = async (conn, m, url, quotedMsg) => {
  try {
    const sent = await conn.sendMessage(
      m.chat,
      { text: "🎵 *جاري تنزيل الاغنيه*..." },
      { quoted: m }
    )

    const apiUrl = `https://api-adonix.ultraplus.click/download/ytaudio?url=${encodeURIComponent(url)}&apikey=SHADOWBOTKEYMD`
    const r = await fetch(apiUrl)
    const data = await r.json()

    if (!data?.status || !data?.data?.url)
      return m.reply("🚫 *تعذر تنزيل الاغنيه*.")

    const fileUrl = data.data.url
    const fileTitle = cleanName(data.data.title || "audio")

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: fileUrl },
        mimetype: "audio/mpeg",
        fileName: fileTitle + ".mp3",
        ptt: false
      },
      { quoted: quotedMsg }
    )

    await conn.sendMessage(
      m.chat,
      { text: `✅ *اكتمل التنزيل*\n\n🎼 *العنوان*: ${fileTitle}`, edit: sent.key }
    )

    await m.react("✅")
  } catch (e) {
    console.error(e)
    m.reply("❌ خطأ: " + e.message)
    m.react("😔")
  }
}

const cleanName = (name) =>
  name.replace(/[^\w\s-_.]/gi, "").substring(0, 50)

const formatViews = (views) => {
  if (views === undefined || views === null) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}K`
  return views.toString()
}

handler.command = ["اغنيه", "اغنية","song","music"]
handler.help = ["اغنيه <نص البحث>"]
handler.tags = ["download"]
handler.register = true

export default handler