let handler = async (m, { conn }) => {

  // ✅ رياكشن قبل البداية
  await m.react('🍒')

  let vcard = `BEGIN:VCARD
VERSION:3.0
FN:𝒉 𝒆 𝒎 𝒂
ORG:𝒉 𝒆 𝒎 𝒂
TITLE:Metatron Executioner of Michael
EMAIL;type=INTERNET:byzaryws@gmail.com
TEL;type=CELL;waid=201017274961:+201017274961
ADR;type=WORK:;;2-chōme-7-5 Fuchūchō;Izumi;Osaka;594-0071;Japan
URL;type=WORK:https://www.instagram.com/g8f4q
X-WA-BIZ-NAME:𝒉 𝒆 𝒎 𝒂
X-WA-BIZ-DESCRIPTION:𝒉 𝒆 𝒎 𝒂 🌿🍒
X-WA-BIZ-HOURS:Mo-Su 00:00-23:59
END:VCARD`

  let qkontak = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: "𝒉 𝒆 𝒎 𝒂",
        vcard
      }
    }
  }

  // 📌 إرسال الكونتاكت مع externalAdReply
  await conn.sendMessage(
    m.chat,
    {
      contacts: {
        displayName: '🌿⃝𝒉 𝒆 𝒎 𝒂⃝🍒',
        contacts: [{ vcard }]
      },
      contextInfo: {
        externalAdReply: {
          title: 'آدخــل بــحــتــرمــك 😔❤️‍🩹',
          body: '🌿⃝𝒂 𝒍 𝒚 𝒂⃝🍒',
          thumbnailUrl: 'https://files.catbox.moe/4yk7kw.jpg',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    },
    { quoted: qkontak }
  )
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = /^(owner|creator|المطورين|المطور|مطور|مطورك|مطوري)$/i

export default handler