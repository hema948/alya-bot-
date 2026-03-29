import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let handler = async (m, { conn }) => {
  try {
    const botPath = path.join(__dirname, '../')
    const zipName = 'alya-bot.zip'
    const zipPath = path.join(botPath, zipName)

    await conn.reply(m.chat, '🗂️ جاري إنشاء نسخة من البوت...', m)

    // ضغط الملفات (استبعد node_modules)
    execSync(`zip -r ${zipName} . -x "node_modules/*"`, {
      cwd: botPath
    })

    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(zipPath),
      mimetype: 'application/zip',
      fileName: zipName
    }, { quoted: m })

    fs.unlinkSync(zipPath)

    await conn.reply(m.chat, '✅ تم إرسال النسخة بنجاح', m)

  } catch (e) {
    await conn.reply(m.chat, '❌ خطأ: ' + e.message, m)
  }
}

handler.command = ['س']
handler.owner = true

export default handler