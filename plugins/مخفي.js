import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto } = baileys

const handler = async (m, { conn, text, participants, isAdmin }) => {

  let channelLink = 'https://whatsapp.com/channel/0029Vb7Xe9q9Bb64VJAGVA38'

  // 🔘 زر + تحويل قناة
  const sendBtn = async (txt) => {
    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({

              body: { text: txt },

              contextInfo: {
                forwardedNewsletterMessageInfo: {
                  newsletterJid: "120363424385354007@newsletter",
                  newsletterName: "𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡 𝐶𝐻𝐴𝑁𝑁𝐸𝐿",
                  serverMessageId: 1
                },
                forwardingScore: 999,
                isForwarded: true
              },

              nativeFlowMessage: {
                buttons: [
                  {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                      display_text: "📢 فتح القناة",
                      url: channelLink
                    })
                  }
                ]
              }

            })
          }
        }
      },
      { quoted: m }
    )

    return conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  }

  if (!m.isGroup) return sendBtn('❌ للجروبات فقط')
  if (!isAdmin) return sendBtn('❌ للمشرفين فقط')
  if (!text) return sendBtn('⚠️ اكتب رسالة')

  let users = participants.map(u => u.id)

  // ✨ تعديل النص
  let newText = text.replace(/^[:\-]?\s*/, '')
  newText = `> ${newText}`

  const msg = generateWAMessageFromContent(
    m.chat,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({

            body: {
              text: `
╭━━━〔 مــنــشــن مــخــفــي 〕━━━╮

${newText}

╰━━━━━━━━━━━━━━━━━━━╯
> 🥀 ⃝𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡⃝🍒
`
            },

            footer: {
              text: '🌿⃝🍒'
            },

            contextInfo: {
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363424385354007@newsletter",
                newsletterName: "𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡 𝐶𝐻𝐴𝑁𝑁𝐸𝐿",
                serverMessageId: 1
              },
              forwardingScore: 999,
              isForwarded: true,
              mentionedJid: users // 👈 منشن مخفي
            },

            nativeFlowMessage: {
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "📢 فتح القناة",
                    url: channelLink
                  })
                }
              ]
            }

          })
        }
      }
    },
    { quoted: m }
  )

  await conn.relayMessage(m.chat, msg.message, {
    messageId: msg.key.id
  })
}

handler.command = ['مخفي']
handler.group = true
handler.admin = true

export default handler