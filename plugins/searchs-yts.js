import yts from "yt-search"
import fetch from "node-fetch"
import baileys from "@whiskeysockets/baileys"

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("🌑✦ اكتب كلمة للبحث في يوتيوب.")

  try {
    await m.react("🕸️")

    const results = await yts(text)
    const videos = results.all.filter(v => v.type === "video")
    if (!videos.length) throw new Error("لم يتم العثور على نتائج.")

    const first = videos[0]

    // 🔥 صورة صغيرة ثابتة
    const smallThumb = await (await fetch("https://i.postimg.cc/rFfVL8Ps/image.jpg")).buffer()

    const businessHeader = {
      key: {
        participants: "0@s.whatsapp.net",
        fromMe: false,
        id: "ShadowYT"
      },
      message: {
        locationMessage: {
          name: "🔍 بحث يوتيوب",
          jpegThumbnail: smallThumb,
          vcard:
            "BEGIN:VCARD\n" +
            "VERSION:3.0\n" +
            "N:;YouTube;;;\n" +
            "FN:YouTube\n" +
            "ORG:Shadow Garden\n" +
            "item1.TEL;waid=5804242773183:+58 0424-2773183\n" +
            "item1.X-ABLabel:بحث\n" +
            "X-WA-BIZ-DESCRIPTION:نتائج البحث من يوتيوب\n" +
            "X-WA-BIZ-NAME:YouTube Search\n" +
            "END:VCARD"
        }
      },
      participant: "0@s.whatsapp.net"
    }

    const media = await prepareWAMessageMedia(
      { image: { url: first.thumbnail } },
      { upload: conn.waUploadToServer }
    )

    await conn.sendMessage(
      m.chat,
      {
        image: { url: first.thumbnail },
        caption:
          `🌑✦ نتائج البحث: *${text}*\n\n` +
          `🎬 *${first.title}*\n` +
          `⏱ ${first.timestamp} • 👁️ ${first.views.toLocaleString()}\n` +
          `🔗 ${first.url}`
      },
      { quoted: businessHeader }
    )

    const rows = videos.slice(0, 20).map(v => ({
      title: v.title,
      description: `📺 القناة: ${v.author.name}`,
      id: v.url
    }))

    const interactive = proto.Message.InteractiveMessage.fromObject({
      body: { text: "🌑✦ اختر فيديو للمشاهدة:" },
      footer: { text: "Shadow Garden — بحث يوتيوب" },
      header: {
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "📜 اختيار فيديو",
              sections: [
                {
                  title: "نتائج يوتيوب",
                  highlight_label: "🔎",
                  rows
                }
              ]
            })
          }
        ],
        messageParamsJson: ""
      },
      contextInfo: {
        mentionedJid: [m.sender]
      }
    })

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: { interactiveMessage: interactive }
        }
      },
      { quoted: businessHeader }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react("✔️")

  } catch (e) {
    await m.react("✖️")
    m.reply(`⚠️ خطأ:\n${e.message}`)
  }
}

handler.command = ["يوتيوب", "بحث", "ytsearch"]
export default handler