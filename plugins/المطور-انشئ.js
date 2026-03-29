import fs from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`╭─❖ 🌿 أوامـر الإنـشـاء ❖─╮

✨ ${usedPrefix + command} مجلد tmp
✨ ${usedPrefix + command} ملف test.js
✨ ${usedPrefix + command} ملف test.txt مرحبا

╰─❖ ⚙️ 𝒉 𝒆 𝒎 𝒂 ❖─╯`)
  }

  const args = text.split(' ')
  const type = args.shift()
  const name = args.shift()
  let content = args.join(' ') || ''

  if (!type || !name) {
    return m.reply('⚠️ لازم تحدد (مجلد / ملف) + الاسم')
  }

  const targetPath = path.join(process.cwd(), name)

  try {
    await m.react('🛠️')

    // ===== إنشاء مجلد =====
    if (type === 'مجلد') {
      if (fs.existsSync(targetPath)) {
        return m.reply('⚠️ المجلد موجود مسبقاً')
      }

      fs.mkdirSync(targetPath, { recursive: true })
      await m.react('✅')

      return m.reply(`╭─❖ 📁 تم الإنشاء ❖─╮
✨ المجلد: ${name}
╰─❖ 🚀 بنجاح ❖─╯`)
    }

    // ===== إنشاء ملف =====
    if (type === 'ملف') {
      if (fs.existsSync(targetPath)) {
        return m.reply('⚠️ الملف موجود مسبقاً')
      }

      // 🔥 لو ملف js ومفيش محتوى
      if (name.endsWith('.js') && !content) {
        content = `let handler = async (m, { conn }) => {

}

handler.command = ['اسم_الأمر']
handler.tags = ['general']
handler.help = ['اسم_الأمر']

export default handler
`
      }

      fs.writeFileSync(targetPath, content)
      await m.react('✅')

      return m.reply(`╭─❖ 📄 تم الإنشاء ❖─╮
✨ الملف: ${name}
╰─❖ 🚀 بنجاح ❖─╯`)
    }

    return m.reply('❌ النوع غير معروف (مجلد / ملف)')

  } catch (e) {
    return m.reply(`❌ خطأ:\n${e.message}`)
  }
}

handler.help = ['انشئ']
handler.tags = ['owner']
handler.command = /^(انشئ)$/i
handler.owner = true

export default handler