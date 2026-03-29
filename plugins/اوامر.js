import { existsSync } from 'fs'
import { join } from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { performance } from 'perf_hooks'

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let old = performance.now()
    let neww = performance.now()
    let speed = (neww - old).toFixed(4)

    const user = await conn.getName(m.sender)

    // بــــنـــيـــك فـــي مـــصـــر
    const fecha = new Date().toLocaleDateString('ar-EG', { 
      timeZone: 'Africa/Cairo',
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    // كــســم مــصــر
    const hora = new Date().toLocaleTimeString('ar-EG', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    let menuText = `╭─◈ 🐉 :: 𝑎 𝑙 𝑦 𝑎 • 𝑏 𝑜 𝑡 :: 🐉 ◈─╮

> أهلاً بك يا : *${user}*

> المستوى :: ${global.db.data.users[m.sender]?.level || 0}

> السرعة :: ${speed} ms

> التاريخ :: ${fecha}

> الوقت :: ${hora}

╰─◈ 🕸 :: 𝑎 𝑙 𝑦 𝑎 :: 🕸 ◈─╯`

    await conn.sendMessage(m.chat, { react: { text: '🐉', key: m.key } })

    const localImagePath = join(process.cwd(), 'Menu.jpg')
    const channel = 'https://whatsapp.com/channel/0029Vb7Xe9q9Bb64VJAGVA38'
    const developerNumber = '201112479305'
    const developerContact = `https://wa.me/${developerNumber}`
    
    const nativeFlowPayload = {
      body: { text: menuText },
      footer: { text: '© 𝑏 𝑦 : ℎ 𝑒 𝑚 𝑎' },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: "⃝🌿 الأقـسام الـرئـيـسـيـة",
              sections: [
                {
                  title: " ⃝🐉 عـرض الأقـسـام ⃝🐉",
                  rows: [
                    { "title": "⃝🍒 قـسم الأدمن", id: ".ق1" },
                    { "title": "⃝🌿 قـسم الاستيكر", id: ".ق2" },
                    { "title": "⃝🍒 قـسم الألعاب", id: ".ق3" },
                    { "title": "⃝🌿 قـسم البحث", id: ".ق4" },
                    { "title": "⃝🍒 قـسم الادوات", id: ".ق5" },
                    { "title": "⃝🌿 قـسم الموارد", id: ".ق6" },
                    { "title": "⃝🍒 قـسم الذكاء", id: ".ق7" },
                    { "title": "⃝🌿 قـسم النقابات", id: ".ق8" },
                    { "title": "⃝🍒 قـسم الصور", id: ".ق9" },
                    { "title": "⃝🌿 قـسم التسليه", id: ".ق10" }
                  ]
                }
              ]
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: "⃝🌿 الــقــنــاة الــرســمــيــة  ⃝🌿",
              url: channel
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: "⃝🌿 مــراســلــة ℎ 𝑒 𝑚 𝑎 ⃝🌿",
              url: developerContact
            })
          }
        ],
        messageParamsJson: JSON.stringify({
          bottom_sheet: {
            in_thread_buttons_limit: 1,
            list_title: "⃝🌿 قـائـمـة أقـسـام الـبـوت ⃝🌿",
            button_title: "⃝🌿 عـرض الأقـسـام ⃝🌿"
          }
        })
      }
    }

    if (existsSync(localImagePath)) {
      const media = await prepareWAMessageMedia({ image: { url: localImagePath } }, { upload: conn.waUploadToServer })
      nativeFlowPayload.header = {
        hasMediaAttachment: true,
        subtitle: '𝑎 𝑙 𝑦 𝑎 • 𝑏 𝑜 𝑡',
        imageMessage: media.imageMessage
      }
    } else {
      nativeFlowPayload.header = { hasMediaAttachment: false, subtitle: '𝑎 𝑙 𝑦 𝑎 • 𝑏 𝑜 𝑡' }
    }

    const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload)
    const fkontak = await makeFkontak()
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { 
      userJid: conn.user.jid, 
      quoted: fkontak 
    })
    
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('خطأ:', e)
  }
}

async function makeFkontak() {
  try {
    const res = await fetch('https://files.catbox.moe/t0hl4l.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: '𝑎 𝑙 𝑦 𝑎 • 𝑏 𝑜 𝑡', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

async function getUptime() {
  let totalSeconds = process.uptime()
  let hours = Math.floor(totalSeconds / 3600)
  let minutes = Math.floor((totalSeconds % 3600) / 60)
  let seconds = Math.floor(totalSeconds % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['الاوامر', 'menu', 'اوامر', 'القائمة', 'منيو']

export default handler