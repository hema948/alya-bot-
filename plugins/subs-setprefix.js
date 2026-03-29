import fs from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {
  const emojip = '> ✿'
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./Sessions/SubBot', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  // التأكد إن المستخدم عنده Sub-Bot
  if (!fs.existsSync(botPath)) {
    return m.reply(`${emojip} ✧ هذا الأمر فقط لمستخدمي السوكيت (Sub-Bot).`)
  }

  // لو ما كتب البادئة
  if (!text) 
    return m.reply(`${emojip} اكتب البادئة اللي تبي تستخدمها.\n
> مثال: ${usedPrefix + command} !
> أو: ${usedPrefix + command} multi`)

  let config = {}

  // قراءة ملف الإعدادات
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath))
    } catch (e) {
      return m.reply('⚠️ حصل خطأ أثناء قراءة الإعدادات.')
    }
  }

  // حفظ البادئة الجديدة
  config.prefix = text.trim().toLowerCase()

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    // الرد بعد التنفيذ
    if (config.prefix === 'multi') {
      m.reply(`${emojip} تم تفعيل وضع *تعدد البوادئ* ✅  
> # $ @ * & ? , ; : + × ! _ - ¿ .`)
    } else {
      m.reply(`${emojip} تم تغيير البادئة بنجاح إلى: *${config.prefix}*`)
    }

  } catch (err) {
    console.error(err)
    m.reply('❌ حصل خطأ أثناء حفظ البادئة.')
  }
}

// أوامر التنفيذ
handler.help = ['setprefix']
handler.tags = ['serbot']
handler.command = ['setprefix']

export default handler