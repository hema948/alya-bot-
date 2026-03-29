import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⌗ استخدم الأمر هكذا: *${usedPrefix + command} الاسم*`)

  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./Sessions/SubBot', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return m.reply('> ✎ هذا الأمر مخصص فقط للبوتات الفرعية (Sub-Bot).')
  }

  let config = {}

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath))
    } catch (e) {
      return m.reply('> » حدث خطأ أثناء قراءة ملف الإعدادات.')
    }
  }

  // تعيين الاسم الجديد
  config.name = text.trim()

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply(`ꕤ︎ تم تغيير اسم البوت إلى: *${text.trim()}*`)
  } catch (err) {
    console.error(err)
    m.reply('❌ حدث خطأ أثناء حفظ الاسم.')
  }
}

handler.help = ['اسم-بوت']
handler.tags = ['سيربوت']
handler.command = ['setname', 'اسم', 'تعيين-اسم']

export default handler