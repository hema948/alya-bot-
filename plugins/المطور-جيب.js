import fs from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(`╭─❖ 📂 أوامـر الجـلب ❖─╮

✨ ${usedPrefix + command} .
✨ ${usedPrefix + command} plugins
✨ ${usedPrefix + command} settings.js

╰─❖ ⚙️ 𝒉 𝒆 𝒎 𝒂 ❖─╯`)
  }

  const targetPath = path.join(process.cwd(), text)

  try {
    // ===== لو المسار غير موجود =====
    if (!fs.existsSync(targetPath)) {
      return m.reply('❌ المسار غير موجود')
    }

    // ===== لو مجلد =====
    if (fs.lstatSync(targetPath).isDirectory()) {

      const files = fs.readdirSync(targetPath)

      let teks = `╭─❖ 📁 محتويات المجلد ❖─╮\n\n`

      files.forEach(f => {
        teks += `📄 ${f}\n`
      })

      teks += `\n╰─❖ 🚀 ${files.length} ملف ❖─╯`

      return m.reply(teks)
    }

    // ===== لو ملف =====
    if (fs.lstatSync(targetPath).isFile()) {

      let content = fs.readFileSync(targetPath, 'utf-8')

      // لو الملف كبير
      if (content.length > 4000) {
        return m.reply('⚠️ الملف كبير جدًا')
      }

      return m.reply(`╭─❖ 📄 محتوى الملف ❖─╮

${content}

╰─❖ 🚀 ${text} ❖─╯`)
    }

  } catch (e) {
    return m.reply(`❌ خطأ:\n${e.message}`)
  }
}

handler.help = ['جيب']
handler.tags = ['owner']
handler.command = /^(جيب|read|get)$/i
handler.owner = true

export default handler