const userSpamData = {}

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, isPrems }) {
  const chat = global.db.data.chats[m.chat]
  const bot = global.db.data.settings[conn.user.jid] || {}

  if (!bot.antiSpam) return
  if (m.isGroup && chat.modoadmin) return  

  // لا تقم بتطبيق مكافحة البريد العشوائي على المالكين أو المسؤولين أو المستخدمين المميزين.
  if (isOwner || isROwner || isAdmin || isPrems) return

  const sender = m.sender
  const currentTime = Date.now()
  const timeWindow = 5000   // 5 ثوانٍ
  const messageLimit = 10   // بحد أقصى 10 رسائل في ذلك الوقت

  if (!(sender in userSpamData)) {
    userSpamData[sender] = {
      lastMessageTime: currentTime,
      messageCount: 1,
      antiBan: 0
    }
  } else {
    const userData = userSpamData[sender]
    const timeDifference = currentTime - userData.lastMessageTime

    // إذا بقيت ضمن الفترة الزمنية المحددة، فسوف تتراكم لديك الرسائل.
    if (timeDifference <= timeWindow) {
      userData.messageCount++

      if (userData.messageCount >= messageLimit) {
        userData.antiBan++

        if (userData.antiBan === 1) {
          await conn.reply(m.chat, `🎄 التحذير الأول @${sender.split('@')[0]}: لا تسبام يا عبد.`, m, { mentions: [sender] })
        } else if (userData.antiBan === 2) {
          await conn.reply(m.chat, `✨ الإنذار الثاني @${sender.split('@')[0]}: إذا أصررتَ على موقفك، فسوف تُطرد..`, m, { mentions: [sender] })
        } else if (userData.antiBan >= 3) {
          if (isBotAdmin) {
            try {
              await conn.reply(m.chat, `❄️ تم طرده بسبب الاسبام: @${sender.split('@')[0]}`, m, { mentions: [sender] })
              await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
            } catch (err) {
              console.error('حدث خطأ أثناء الإخراج:', err)
              await conn.reply(m.chat, `⚠️ لم أستطع طرد @${sender.split('@')[0]} على الرغم من أنني ادمن.`, m, { mentions: [sender] })
            }
          } else {
await conn.reply(m.chat, `⚠️ لا أستطيع طرد أي شخص لأني لستُ ادمن، ولكن @${sender.split('@')[0]} يرسل اسبام.`, m, { mentions: [sender] })
          }
        }

        // عداد إعادة الضبط
        userData.messageCount = 1
      }
    } else {
      // إذا مر وقت أطول، فأعد العد من جديد.
      userData.messageCount = 1
    }

    userData.lastMessageTime = currentTime
  }
}

export default handler