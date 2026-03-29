import axios from "axios";
import {
  generateWAMessageContent,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {

  if (!text) return m.reply('🍒 اكتب كلمة للبحث');

  await m.react('⏳');

  try {
    let { data } = await axios.get(
      `https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text + ' hd')}`
    );

    let images = data.slice(0, 6).map(v => v.image_large_url);
    if (!images.length) return m.reply('❌ مفيش صور');

    await m.react('✅');

    let cards = []

    async function createImageMessage(url) {
      const { imageMessage } = await generateWAMessageContent(
        { image: { url } },
        { upload: conn.waUploadToServer }
      )
      return imageMessage
    }

    for (let img of images) {

      const imageMsg = await createImageMessage(img)

      cards.push({
        body: {
          text: `┏━━━━━━━━━━━━━━━┓
ℹ️ لا أتحمل ذنوب ما بحثت
┗━━━━━━━━━━━━━━━┛

🔥 alya-bot 🔥`
        },

        header: {
          hasMediaAttachment: true,
          imageMessage: imageMsg
        },

        nativeFlowMessage: {
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "🍁 فتح في بنترست",
                url: "https://www.pinterest.com/"
              })
            }
          ]
        }

      })
    }

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: {
                text: `┏━━━━━━━━━━━━━━━┓
✅ تم التحميل بنجاح
┗━━━━━━━━━━━━━━━┛`
              },
              carouselMessage: { cards }
            }
          }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, {
      messageId: msg.key.id
    })

  } catch (e) {
    await m.react('❌');
    m.reply('❌ حصل خطأ');
  }
};

// ✅ الأمر باسم بنترست فقط
handler.command = /^بنترست$/i;

export default handler;