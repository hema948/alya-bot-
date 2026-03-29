import { jidDecode } from '@whiskeysockets/baileys'
import path from 'path'
import fs from 'fs'
import ws from 'ws'

const linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

const handler = async (m, { conn, command, usedPrefix, text }) => {
  try {

    const isSubBots = [conn.user.jid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].includes(m.sender)
    if (!isSubBots)
      return m.reply(`❀ هذا الأمر خاص بالسوكيت فقط.`)

    switch (command) {

      // ⚙️ أوضاع البوت
      case 'self': case 'public': case 'antiprivate': case 'gponly':
      case 'ذاتي': case 'عام': case 'مضاد-خاص': case 'قروبات': {

        const config = global.db.data.settings[conn.user.jid]
        const value = text ? text.trim().toLowerCase() : ''

        const type =
          /self|ذاتي/.test(command) ? 'self' :
          /public|عام/.test(command) ? 'self' :
          /antiprivate|مضاد-خاص/.test(command) ? 'antiPrivate' :
          /gponly|قروبات/.test(command) ? 'gponly' : null

        if (!type) return m.reply(`ꕥ وضع غير معروف.`)

        const isEnable = config[type] || false
        const enable = value === 'enable' || value === 'on' || value === 'تفعيل'
        const disable = value === 'disable' || value === 'off' || value === 'تعطيل'

        if (enable || disable) {
          if (isEnable === enable)
            return m.reply(`ꕥ الوضع *${type}* بالفعل ${enable ? 'مفعل' : 'معطل'}.`)

          config[type] = enable

          return conn.reply(
            m.chat,
            `✎ تم *${enable ? 'تفعيل' : 'تعطيل'}* وضع *${type}* بنجاح.`,
            m
          )
        }

        conn.reply(
          m.chat,
          `✦ التحكم في وضع *${type}*:\n\n` +
          `● تفعيل » ${usedPrefix}${command} تفعيل\n` +
          `● تعطيل » ${usedPrefix}${command} تعطيل\n\n` +
          `✧ الحالة » *${isEnable ? '✓ مفعل' : '✗ معطل'}*`,
          m
        )
        break
      }

      // 🔗 دخول قروب
      case 'join': case 'ادخل': {
        if (!text)
          return m.reply(`❀ ارسل رابط القروب.`)

        const [_, code] = text.match(linkRegex) || []
        if (!code)
          return m.reply(`ꕥ الرابط غير صحيح.`)

        await m.react('🕒')
        await conn.groupAcceptInvite(code)
        await m.react('✔️')

        m.reply(`❀ تم دخول القروب بنجاح.`)
        break
      }

      // 🚪 خروج
      case 'leave': case 'salir': case 'اطلع': {
        await m.react('🕒')

        const id = text || m.chat
        const chat = global.db.data.chats[m.chat]

        chat.welcome = false

        await conn.reply(
          id,
          `😓 سيتم الخروج من القروب... وداعاً 👋`,
          m
        )

        await conn.groupLeave(id)
        chat.welcome = true

        await m.react('✔️')
        break
      }

      // 🔓 تسجيل خروج
      case 'logout': case 'تسجيل-خروج': {
        const rawId = conn.user?.id || ''
        const cleanId = jidDecode(rawId)?.user || rawId.split('@')[0]

        const index = global.conns?.findIndex(c => c.user.jid === m.sender)

        if (global.conn.user.jid === conn.user.jid)
          return conn.reply(m.chat, '❀ هذا الأمر غير متاح للبوت الرئيسي.', m)

        if (index === -1 || !global.conns[index])
          return conn.reply(m.chat, '⚠️ لا توجد جلسة نشطة.', m)

        conn.reply(m.chat, '✩ تم تسجيل الخروج بنجاح.', m)

        setTimeout(async () => {
          await global.conns[index].logout()
          global.conns.splice(index, 1)

          const sessionPath = path.join(global.jadi, cleanId)

          if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true })
          }
        }, 3000)

        break
      }

      // 🔄 إعادة تشغيل
      case 'reload': case 'اعادة-تشغيل': {
        const rawId = conn.user?.id || ''
        const cleanId = jidDecode(rawId)?.user || rawId.split('@')[0]

        const sessionPath = path.join(global.jadi, cleanId)

        if (!fs.existsSync(sessionPath))
          return conn.reply(m.chat, '⌗ هذا الأمر خاص بالسب بوت.', m)

        await m.react('🕒')

        if (typeof global.reloadHandler !== 'function')
          throw new Error('لم يتم العثور على دالة reloadHandler')

        await global.reloadHandler(true)

        await m.react('✔️')
        conn.reply(m.chat, '✿ تم إعادة التشغيل بنجاح.', m)
        break
      }
    }

  } catch (error) {
    await m.react('✖️')
    conn.reply(
      m.chat,
      `⚠️ حدث خطأ.\n\n${error.message || error}`,
      m
    )
  }
}

handler.command = [
  'self', 'public', 'antiprivate', 'gponly',
  'ذاتي', 'عام', 'مضاد-خاص', 'قروبات',
  'join', 'ادخل',
  'leave', 'salir', 'اطلع',
  'logout', 'تسجيل-خروج',
  'reload', 'اعادة-تشغيل'
]

handler.help = handler.command
handler.tags = ['سيربوت']

export default handler