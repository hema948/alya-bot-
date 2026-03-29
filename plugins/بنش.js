import fs from 'fs'
import path from 'path'

let handler = async (m, { isMods, isOwner, text }) => {
  if (!isOwner && !isMods)
    return m.reply('❌ هذا الأمر للمطورين فقط')

  if (!text || !text.includes('|'))
    return m.reply('❌ الصيغة الصحيحة:\nبدل النص_القديم | النص_الجديد')

  let [oldText, newText] = text.split('|').map(v => v.trim())
  if (!oldText || !newText)
    return m.reply('❌ تأكد من كتابة النصين')

  const baseDir = process.cwd()
  let filesChanged = 0

  function scan(dir) {
    const files = fs.readdirSync(dir)
    for (let file of files) {
      const fullPath = path.join(dir, file)

      if (file === 'node_modules' || file === '.git') continue

      if (fs.statSync(fullPath).isDirectory()) {
        scan(fullPath)
      } else if (file.endsWith('.js')) {
        let content = fs.readFileSync(fullPath, 'utf8')
        if (content.includes(oldText)) {
          content = content.split(oldText).join(newText)
          fs.writeFileSync(fullPath, content)
          filesChanged++
        }
      }
    }
  }

  scan(baseDir)

  m.reply(
`♻️ *تم الاستبدال بنجاح*

🔁 من: \`${oldText}\`
🔁 إلى: \`${newText}\`

📂 عدد الملفات المتأثرة: *${filesChanged}*`
  )
}

handler.help = ['بنش']
handler.tags = ['devs']
handler.command = /^بنش$/i
handler.owner = true

export default handler