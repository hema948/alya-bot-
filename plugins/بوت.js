// =========[ ALYA Video System ]=========

// القوائم
const videoLists = {
  بووت: [
    "https://files.catbox.moe/osxi0r.mp4",
  ],

  اليا: [
    "https://files.catbox.moe/7rz1md.mp4",
  ],

  حياتي: [
    "https://files.catbox.moe/v5xwga.mp4"
  ]
}

// منع التكرار
const lastVideo = new Map()

const handler = async (m, { conn, command }) => {
  try {

    // ===== أمر القائمة =====
    if (command === 'بوت') {

      // 🔥 يجيب الأوامر تلقائي
      const cmds = Object.keys(videoLists)
        .map(cmd => `✦ .${cmd}`)
        .join('\n')

      return m.reply(`
╭━━━〔 🎥 أوامر الفيديو 〕━━━╮

${cmds}

╰━━━━━━━━━━━━━━━━━━━╯
> 🥀 ⃝𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡⃝🍒
`)
    }

    // ===== تشغيل فيديو =====
    const videos = videoLists[command]

    if (!videos)
      return m.reply('❌ هذا الأمر غير موجود')

    if (!videos.length)
      return m.reply('❌ لا توجد فيديوهات')

    let videoUrl
    do {
      videoUrl = videos[Math.floor(Math.random() * videos.length)]
    } while (
      videoUrl === lastVideo.get(m.chat + command) &&
      videos.length > 1
    )

    lastVideo.set(m.chat + command, videoUrl)

    // ===== الشكل الاحترافي =====
    let senderId = m.sender.split('@')[0]

    const fkontak = {
      key: {
        participants: "0@s.whatsapp.net",
        fromMe: false,
        id: "ALYA"
      },
      message: {
        contactMessage: {
          displayName: '🐱⸽⃕❬ 🥀 ⃝𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡⃝🍒 ❭ - 🧸🍁⃨፝⃕✰',
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:alya Bot
item1.TEL;waid=${senderId}:${senderId}
END:VCARD`
        }
      },
      participant: "0@s.whatsapp.net"
    }

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        ptv: true,
        caption: `
🎥 ${command}

> 🥀 ⃝𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡⃝🍒
`
      },
      { quoted: fkontak }
    )

  } catch (err) {
    console.error(err)
    m.reply('❌ حدث خطأ أثناء إرسال الفيديو')
  }
}

// الأوامر
handler.command = ['بوت', 'بووت', 'اليا', 'حياتي']
handler.help = ['بوت', 'بووت', 'اليا', 'حياتي']
handler.tags = ['fun']

export default handler