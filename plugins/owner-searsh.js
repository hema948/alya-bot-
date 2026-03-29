import fs from 'fs'
import path from 'path'

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) return m.reply(`🔎 استخدم:\n${usedPrefix + command} <الكلمة أو الحرف>\n\nمثال:\n${usedPrefix + command} ا`)

  let baseDir = './plugins'
  let files = getAllJsFiles(baseDir)

  let results = []
  let codeCounter = 1

  for (let file of files) {
    let content = fs.readFileSync(file, 'utf-8')
    let lines = content.split('\n')

    lines.forEach((line, index) => {
      if (line.includes(text)) {
        results.push({
          codeNum: codeCounter++,
          file: path.basename(file),
          lineNum: index + 1,
          lineText: line.trim()
        })
      }
    })
  }

  if (results.length === 0) {
    return m.reply(`❌ مفيش أي تطابق مع "${text}" في الملفات 😢`)
  }

  let output = `✅ تم العثور على "${text}" في الملفات التالية:\n\n`
  for (let res of results) {
    output += `📄 رقم الكود: ${res.codeNum}\n📄 الملف: ${res.file}\n🔢 السطر: ${res.lineNum}\n➡️ السطر: ${res.lineText}\n\n`
  }

  // لو النتيجة طويلة نبعته كملف
  if (output.length > 4000) {
    const filePath = './tmp/search_results.txt'
    fs.writeFileSync(filePath, output)
    await conn.sendFile(m.chat, filePath, 'search_results.txt', `📁 النتائج كتير، فبعتهالك كملف ✅`, m)
    fs.unlinkSync(filePath)
  } else {
    await conn.reply(m.chat, output.trim(), m)
  }
}

handler.help = ['ابحث <كلمة>']
handler.tags = ['owner']
handler.command = /^ابحث$/i
handler.owner = true

export default handler

function getAllJsFiles(dirPath, arrayOfFiles = []) {
  let files = fs.readdirSync(dirPath)

  for (let file of files) {
    let filePath = path.join(dirPath, file)
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllJsFiles(filePath, arrayOfFiles)
    } else if (filePath.endsWith('.js')) {
      arrayOfFiles.push(filePath)
    }
  }

  return arrayOfFiles
}