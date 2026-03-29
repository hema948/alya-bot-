import fs from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`╭─❖ 🗑️ أوامـر الحـذف ❖─╮

✨ ${usedPrefix + command} مجلد tmp
✨ ${usedPrefix + command} ملف test.js

╰─❖ ⚙️ 𝒉 𝒆 𝒎 𝒂 ❖─╯`)
  }

  const args = text.split(' ')
  const type = args.shift()
  const name = args.shift()

  if (!type || !name) {
    return m.reply('⚠️ لازم تحدد (مجلد / ملف) + الاسم')
  }

  const targetPath = path.join(process.cwd(), name)

  try {
    await m.react('🗑️')

    if (type === 'مجلد') {
      if (!fs.existsSync(targetPath)) {
        return m.reply('⚠️ المجلد غير موجود')
      }

      fs.rmSync(targetPath, { recursive: true, force: true })
      await m.react('✅')

      return m.reply(`╭─❖ 🗑️ تم الحذف ❖─╮
✨ المجلد: ${name}
╰─❖ ✔️ بنجاح ❖─╯`)
    }

    if (type === 'ملف') {
      if (!fs.existsSync(targetPath)) {
        return m.reply('⚠️ الملف غير موجود')
      }

      fs.unlinkSync(targetPath)
      await m.react('✅')

      return m.reply(`╭─❖ 🗑️ تم الحذف ❖─╮
✨ الملف: ${name}
╰─❖ ✔️ بنجاح ❖─╯`)
    }

    return m.reply('❌ النوع غير معروف (مجلد / ملف)')

  } catch (e) {
    return m.reply(`❌ خطأ:\n${e.message}`)
  }
}

handler.help = ['حذف']
handler.tags = ['owner']
handler.command = /^(حذف)$/i
handler.owner = true

export default handler