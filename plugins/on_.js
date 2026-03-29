import fetch from 'node-fetch'
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i
const defaultImage = 'https://files.catbox.moe/l78472.jpg'

// ================== COMMAND ==================
const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  const type = (args[0] || '').toLowerCase()

  const list = {
    antilink: '🚫 مضاد روابط',
    welcome: '👋 ترحيب',
    antispam: '⚠️ مضاد سبام',
    antitoxic: '💢 مضاد سب',
    antibot: '🤖 مضاد بوتات',
    antiarab: '🌍 مضاد عربي'
  }

  // ===== زر اختيار =====
  if (!type) {

    // 🔥 جلب صورة الجروب
    let pp
    try {
      pp = await conn.profilePictureUrl(m.chat, 'image')
    } catch {
      pp = defaultImage
    }

    const media = await prepareWAMessageMedia(
      { image: { url: pp } },
      { upload: conn.waUploadToServer }
    )

    const rows = Object.keys(list).map(v => ({
      title: list[v],
      description: `الحالة: ${chat[v] ? '🟢 شغال' : '🔴 متوقف'}`,
      id: `.toggle ${v}`
    }))

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: { text: '⚙️ اختر النظام للتحكم فيه' },
              footer: { text: '> 🥀 ⃝𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡⃝🍒٭' },
              header: {
                hasMediaAttachment: true,
                imageMessage: media.imageMessage
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "📋 قائمة الأنظمة",
                      sections: [
                        {
                          title: "الأنظمة",
                          rows
                        }
                      ]
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

  if (!(isAdmin || isOwner)) {
    return m.reply('❌ هذا الأمر للمشرفين فقط')
  }

  // ===== TOGGLE =====
  if (list[type]) {
    chat[type] = !chat[type]

    return m.reply(
`╭━━━〔 ⚙️ تم التعديل 〕━━━╮
✦ النظام: ${list[type]}
✦ الحالة: ${chat[type] ? '🟢 مفعل' : '🔴 متوقف'}
╰━━━━━━━━━━━━━━━╯`
    )
  }

  return m.reply('❌ نظام غير معروف')
}

handler.command = ['on', 'off', 'toggle']
handler.group = true
handler.register = true
handler.tags = ['group']

handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  // ANTI SPAM
  if (chat.antispam && m.text && m.text.length > 5000) {
    const delet = m.key.participant
    const msgID = m.key.id
    const userTag = `@${m.sender.split('@')[0]}`

    const fakemek = {
      key: { participant: '0@s.whatsapp.net', remoteJid: '0@s.whatsapp.net' },
      message: {
        groupInviteMessage: {
          groupJid: '51995386439-1616969743@g.us',
          inviteCode: 'm',
          groupName: 'P',
          caption: '🚫 تم اكتشاف رسالة مزعجة',
          jpegThumbnail: null
        }
      }
    }

    if (!isBotAdmin) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ تم اكتشاف رسالة طويلة جدًا من ${userTag}\nلكنني لست مشرفًا لذا لا أستطيع حذفها!`,
        mentions: [m.sender]
      }, { quoted: fakemek })
      return false
    }

    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: msgID,
          participant: delet
        }
      })

      await conn.sendMessage(m.chat, {
        text: `🚫 تم حذف رسالة طويلة جدًا\nالمستخدم: ${userTag}`,
        mentions: [m.sender]
      }, { quoted: fakemek })
    } catch (error) {
      console.error("Error:", error)
      await conn.sendMessage(m.chat, {
        text: `⚠️ حدث خطأ أثناء محاولة حذف الرسالة الطويلة`,
        mentions: [m.sender]
      }, { quoted: fakemek })
    }

    return false
  }

  // ANTI-ARABE
  if (chat.antiarabe && m.messageStubType === 27) {
    const newJid = m.messageStubParameters?.[0]
    if (!newJid) return

    const number = newJid.split('@')[0].replace(/\D/g, '')
    const arabicPrefixes = ['20', '971', '965', '966', '974', '973', '962']
    const isArab = arabicPrefixes.some(prefix => number.startsWith(prefix))

    if (isArab) {
      await conn.sendMessage(m.chat, { text: `🚫 المستخدم ${newJid} تم طرده بسبب التفعيل التلقائي لميزة [Anti Arabe]` })
      await conn.groupParticipantsUpdate(m.chat, [newJid], 'remove')
      return true
    }
  }

  // ANTI-LINK
  if (chat.antilink) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const isUserAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
    const text = m?.text || ''

    if (!isUserAdmin && (linkRegex.test(text) || linkRegex1.test(text))) {
      const userTag = `@${m.sender.split('@')[0]}`
      const delet = m.key.participant
      const msgID = m.key.id

      try {
        const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (text.includes(ownGroupLink)) return
      } catch {}

      try {
        await conn.sendMessage(m.chat, {
          text: `🚫 Hey ${userTag}, لا يسمح بنشر الروابط.`,
          mentions: [m.sender]
        }, { quoted: m })

        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: msgID,
            participant: delet
          }
        })

        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      } catch {
        await conn.sendMessage(m.chat, {
          text: `⚠️ لم أتمكن من حذف أو طرد ${userTag}.`,
          mentions: [m.sender]
        }, { quoted: m })
      }

      return true
    }
  }

// ANTI-TOXIC (الجزء المُصحح والمُعدّل)
if (chat.antitoxic && m.text) {
  const toxicRegex = /(^|\s)(كسمك|كسم|كسمين|كسمكو|كس|كسك|كسها|كسهم|كسكو|كس امك|كس اختك|كس ابوك|زبي|زبيك|زبك|زبه|زبها|زبو|زبهم|زبالة عرض|منيوك|منيوكة|منيوكين|منيوكات|متناك|متناكة|متناكين|متناكات|شرموطة|شراميط|شرمط|شرمطة|قحبة|قحبه|قحاب|قحب|ابن المتناكة|ابن القحبة|ابن الزنا|ابن الحرام|يلعن امك|يلعن اختك|يلعن ابوك|يلعن اهلك|يلعن عيلتك|يا منيوك|يا متناك|يا ابن المتناكة|يا ابن القحبة|يا ولد القحبة|يا ولد الزنا|يا ولد الحرام|ديوث|قواد|زاني|فاجر|عرص|عرصة|عرصات|لوطي|شاذ|شذوذ|نجس|قذر|وسخ قوي|وسخ نجس|ملعون|ملعون ابوكم|ملعون اهلك|نجس العرض|قذر العرض)(\s|$)/i;

  const delet = m.key.participant;
  const bang = m.key.id;
  const fakemek = {
    key: { participant: '0@s.whatsapp.net', remoteJid: '0@s.whatsapp.net' },
    message: {
      groupInviteMessage: {
        groupJid: '51995386439-1616969743@g.us',
        inviteCode: 'm',
        groupName: 'P',
        caption: '🚫 تم اكتشاف رسالة مزعجة',
        jpegThumbnail: null
      }
    }
  };

  const textLower = m.text.toLowerCase();
  const isToxic = toxicRegex.exec(textLower);

  // التحقق من المالك (افترض أن لديك دالة isOwner أو قائمة المالكين، أضفها إذا لم تكن موجودة)
  const owners = global.db.data.settings[conn.user.id]?.owners || []; // أو قائمة المالكين الخاصة بك
  const isSenderOwner = owners.includes(m.sender) || m.sender === conn.user.id;

  if (isToxic && !isSenderOwner && !isAdmin) {
    if (!isBotAdmin) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ تم اكتشاف كلمة ممنوعة (${isToxic[0]}) لكنني لست مشرفًا لذا لا أستطيع حذف الرسالة.`,
        mentions: [m.sender]
      }, { quoted: fakemek });
      return false;
    }

    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: bang,
          participant: delet
        }
      });
    } catch (e) {
      console.log('خطأ في حذف الرسالة:', e);
    }

    // استخدام global.db بدلاً من database للتوافق مع باقي الكود
    if (!global.db.data.users) global.db.data.users = {};
    const user = global.db.data.users[m.sender] || { warn: 0 };
    user.warn = (user.warn || 0) + 1;
    global.db.data.users[m.sender] = user;
    // حفظ التغييرات (افترض أن لديك دالة حفظ، أو استخدم fs إذا كانت موجودة)
    // إذا كان global.db يحفظ تلقائيًا، أزل هذا السطر

    if (user.warn < 4) {
      await conn.sendMessage(m.chat, {
        text: `@${m.sender.split('@')[0]}، لقد استخدمت كلمة ممنوعة. لديك الآن ${user.warn}/4 من التحذيرات قبل الحظر.`,
mentions: [m.sender]
      }, { quoted: fakemek });
    } else {
      user.warn = 0;
      user.banned = true;
      global.db.data.users[m.sender] = user;
      // حفظ التغييرات هنا أيضًا

      await conn.sendMessage(m.chat, {
        text: `تم حظرك من المجموعة بسبب تكرار استخدام الكلمات الممنوعة\n*@${m.sender.split('@')[0]}*`,
        mentions: [m.sender]
      }, { quoted: fakemek });

      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      } catch (e) {
        console.log('خطأ في طرد المستخدم:', e);
      }
    }

    return false;
  }
}
  // WELCOME / BYE
  if (chat.welcome && [27, 28, 32].includes(m.messageStubType)) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupSize = groupMetadata.participants.length
    const userId = m.messageStubParameters?.[0] || m.sender
    const userMention = `@${userId.split('@')[0]}`
    const groupDescription = groupMetadata.desc || "لا يوجد وصف متاح";
    let profilePic

    try {
      profilePic = await conn.profilePictureUrl(userId, 'image')
    } catch {
      profilePic = defaultImage
    }

    if (m.messageStubType === 27) {
      const txtWelcome = '*مـــنـــور/ه يــقــلــب اخوك/ي*'
      const bienvenida = `
      ┏┅┅━━━━━━━━━━━━━━━━━━━┓
┃╻🆕╹↵ ❮ تـرحـيـب عـضـو ↯ ❯
┣┅ ━━━━━━━━━━━━━━━━━ ┅ ━┣

> مـنـور مـجـمـوعـتـنـا الـجـميـلـة🌺✨
نـتـمـنـى أن تـسـتـمـتـع 🌷
┣┅ ━━━━━━━━━━━━━━━━━ ┅ ━┣
┃╻ℹ️╹↵ ❮ مـعـلـومـات ↯ ❯
┃╻🔖╹↵ ${userMention}
┃╻🗞️╹↵ ${groupMetadata.subject}
┃╻🌡️╹↵ ${groupSize}
┣┅ ━━━━━━━━━━━━━━━━━ ┅ ━┣
┃╻📜╹↵ ❮ الـوصـف ↯ ❯
┃╻✨╹↵ ${groupDescription}
┗┅┅━━━━━━━━━━━━━━━━━━━┛
> 🥀 ⃝𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡⃝🍒٭
`.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: `${txtWelcome}\n\n${bienvenida}`,
        contextInfo: { mentionedJid: [userId] }
      })

      await conn.sendMessage(m.chat, {
        audio: { url: 'https://files.catbox.moe/b4pndb.opus' },
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      })
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      const txtBye = '*فداهية 🐦☕* *تطلع يجي غيرك عادي ...*'
      const despedida = `
┏┅┅━━━━━━━━━━━━━━━━━━━┓
┃╻😢╹↵ ❮ خـروج عـضـو ↯ ❯
┣┅ ━━━━━━━━━━━━━━━━━ ┅ ━┣

> وداعـــا يـــا نـتـمنـى لـك حـيـاة جـمـيـلـة 🌺✨
> يـمـشـي و يـجـي غـيـرك🌷
┣┅ ━━━━━━━━━━━━━━━━━ ┅ ━┣
┃╻ℹ️╹↵ ❮ مـعـلـومـات ↯ ❯
┃╻🔖╹↵ ${userMention}
┃╻🗞️╹↵ ${groupMetadata.subject}
┣┅ ━━━━━━━━━━━━━━━━━ ┅ ━┣
┃╻ℹ️╹↵ ❮ عـدد الـاعـضـاء ↯ ❯
┃╻👤╹↵ ${groupSize}
┗┅┅━━━━━━━━━━━━━━━━━━━┛
> 🥀 ⃝𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡⃝🍒٭
`.trim()
      

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: `${txtBye}\n\n${despedida}`,
        contextInfo: { mentionedJid: [userId] }
      })
    }
  }
}

export default handler