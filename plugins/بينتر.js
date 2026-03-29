import axios from 'axios'

let handler = async (m, { conn, text }) => {

  if (!text) return m.reply('⚠️ send Pinterest link')

  await m.react('⏳')

  let videoUrl = null

  try {

    // 🔥 API 1
    try {
      let res = await axios.get(`https://pinterestdownloader.io/frontendService/DownloaderService?url=${encodeURIComponent(text)}`)
      let data = res.data

      let vid = data?.medias?.find(v => v.extension === 'mp4')
      if (vid) videoUrl = vid.url
    } catch {}

    // 🔥 API 2
    if (!videoUrl) {
      try {
        let res = await axios.get(`https://api.agatz.xyz/api/pinterest?url=${encodeURIComponent(text)}`)
        let url = res.data?.data?.result

        if (url && url.includes('.mp4')) videoUrl = url
      } catch {}
    }

    // 🔥 API 3 (قوي)
    if (!videoUrl) {
      try {
        let res = await axios.get(`https://api.vreden.my.id/api/pinterestdl?url=${encodeURIComponent(text)}`)
        let url = res.data?.result?.video

        if (url) videoUrl = url
      } catch {}
    }

    // ❌ هنا بس نحكم
    if (!videoUrl) {
      await m.react('❌')
      return m.reply('❌ This link has no video (image or unsupported)')
    }

    await m.react('✅')

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: '🎬 Pinterest Video'
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    await m.react('❌')
    m.reply('❌ Failed to download')
  }
}

handler.command = /^بينتر$/i
export default handler