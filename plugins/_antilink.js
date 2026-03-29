let linkRegex1 = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})|5chat-whatzapp\.vercel\.app/i
let linkRegex2 = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i

// ========== النصوص المزخرفة ==========
const TEXTS = {
  notAdmin: `╭━━━〔 🚫 مــنــع الــروابــط 〕━━━╮

✦ ❌ الـبـوت لـيـس مـشـرفـًا
✦ ⚠️ لا أسـتـطـيـع حـذف الـروابـط

╰━━━━━━━━━━━━━━━━━━━╯`,

  warning: `╭━━━〔 ⚠️ تــحــذيــر 〕━━━╮

✦ 👤 تـم اكـتـشـاف عـضـو مـخـالـف
✦ 🔗 قـام بـنـشـر رابـط

✦ 🚫 سـيـتـم طـرده فـورًا

╰━━━━━━━━━━━━━━━━━━━╯`,

  removed: `╭━━━〔 ✅ تــم الــتــنــفــيــذ 〕━━━╮

✦ 👤 تـم طـرد الـعـضـو
✦ 🔗 بـسـبـب نـشـر رابـط

✦ 🛡️ نـشـكـرك عـلـى الاحـتـرام

╰━━━━━━━━━━━━━━━━━━━╯`,

  error: `╭━━━〔 ❌ خــطــأ 〕━━━╮

✦ ⚠️ فـشـل فـي عـمـلـيـة الـطـرد
✦ 👑 يـرجـى الـتـنـفـيـذ يـدويـًا

╰━━━━━━━━━━━━━━━━━━━╯`
}

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {

  if (!m.isGroup) return
  if (isAdmin || m.fromMe || isOwner || isROwner) return

  let chat = global.db.data.chats[m.chat]
  if (!chat?.antiLink) return

  let text = m.text || m.caption || ''
  if (!text) return

  const isGroupLink = linkRegex1.test(text) || linkRegex2.test(text)
  if (!isGroupLink) return

  if (!isBotAdmin) {
    return conn.sendMessage(m.chat, { text: TEXTS.notAdmin }, { quoted: m })
  }

  let user = m.sender

  try {
    // تجاهل رابط نفس المجموعة
    let linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
    if (text.includes(linkThisGroup)) return

    // حذف الرسالة
    await conn.sendMessage(m.chat, { delete: m.key })

    // إرسال تحذير
    await conn.sendMessage(m.chat, { text: TEXTS.warning }, { quoted: m })

    // طرد العضو
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

    // تأكيد الطرد
    await conn.sendMessage(m.chat, { text: TEXTS.removed })

  } catch (err) {
    console.log(err)
    await conn.sendMessage(m.chat, { text: TEXTS.error }, { quoted: m })
  }

  return true
}

export default handler