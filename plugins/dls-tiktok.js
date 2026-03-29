import fetch from 'node-fetch'
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, generateWAMessageContent, proto } = baileys

var handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
`[ 🕸️ ] *نسيت الرابط يا مظ* \n\n[ 🧠 ] *مثال*: ${usedPrefix + command} https://vt.tiktok.com/ZSu2fnx71/`
    )
  }

  if (!args[0].match(/(https?:\/\/)?(www\.)?(vm\.|vt\.)?tiktok\.com\//)) {
    return m.reply(
      `[ ⚠️ ] *الرابط مش رابط TikTok تأكد من إدخال رابط TikTok يا عسل*`
    )
  }

  try {
    await conn.reply(
      m.chat,
      '[ ⏳ ] *جاري التحميل ، حاول استغلال لحظات الانتظار في الاستغفار*...',
      m
    )

    const tiktokData = await tiktokdl(args[0])

    if (!tiktokData || !tiktokData.data) {
      return m.reply(
        '[ 🙅 ] *حدث خطأ ما ،تاكد من إدخال رابط صالح*.'
      )
    }

    const videoURL = tiktokData.data.play
    const ErenInfo = `📜 *العنوان*:\n> ${tiktokData.data.title || 'بلا عنوان'}`

    // Header type WhatsApp Business (miniature + description below)
    const businessHeader = {
      key: { participants: '0@s.whatsapp.net', fromMe: false, id: '𝚊𝚕𝚢𝚊 𝙱𝚘𝚝' },
      message: {
        locationMessage: {
          name: '𝙩𝙞𝙠𝙩𝙤𝙠 👑',
          jpegThumbnail: await (await fetch('https://files.catbox.moe/dsgmid.jpg')).buffer(),
          vcard:
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'N:;Eren;;;\n' +
            'FN:Eren\n' +
            'ORG:Eminence in Eren\n' +
            'TITLE:\n' +
            'item1.TEL;waid=5804242773183:+58 0424-2773183\n' +
            'item1.X-ABLabel:Eren\n' +
            'X-WA-BIZ-DESCRIPTION:download TikTok video\n' +
            'X-WA-BIZ-NAME:Eren\n' +
            'END:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    }

    const media = await generateWAMessageContent({
      video: { url: videoURL },
      caption: 'اكتمل التحميل\n\n' + ErenInfo
    }, { upload: conn.waUploadToServer })

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: { text: '*اكتمل التحميل* ❤️‍🩹\n\n' + ErenInfo },
            footer: { text: '🍃 𝚊𝚕𝚢𝚊 𝙱𝚘𝚝' },
            header: {
              hasMediaAttachment: true,
              videoMessage: media.videoMessage
            },
            nativeFlowMessage: {
              buttons: [
                {
  name: 'cta_copy',
  buttonParamsJson: JSON.stringify({
    display_text: 'نسخ رابط الفيديو',
    copy_code: args[0]
  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'المشاهده في التطبيق',
                    url: args[0],
                    merchant_url: args[0]
                  })
                }
              ]
            },
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: false
            }
          })
        }
      }
    }, { quoted: businessHeader })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (error1) {
    conn.reply(
      m.chat,
      `[ 🩸 ] *تم اكتشاف خطأ*: ${error1}\n*يرجي الاتصال بالمطور في اسرع وقت*...`,
      m
    )
  }
}

handler.help = ['تيك <رابط التحميل>']
handler.tags = ['download']
handler.command = ['tt', 'tiktok','تيك','تيكتوك','تحميل-تيك','تحميل-تيكتوك']

export default handler

async function tiktokdl(url) {
  const tikwm = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  const response = await (await fetch(tikwm)).json()
  return response
      }