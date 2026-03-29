let handler = async (m, { conn, text }) => {

  if (!text) return m.reply('⚠️ ارسل رابط مستودع GitHub')

  try {
    await m.react('⏳')

    let regex = /github\.com\/([^\/]+)\/([^\/]+)/i
    let match = text.match(regex)

    if (!match) return m.reply('❌ الرابط غير صالح')

    let user = match[1]
    let repo = match[2].replace('.git', '')

    let zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball`

    await m.react('📥')

    await conn.sendMessage(m.chat, {
      document: { url: zipUrl },
      mimetype: 'application/zip',
      fileName: `${repo}.zip`,
      caption: `╭━━━〔 📦 GitHub Downloader 〕━━━╮

📂 المستودع:
➤ ${repo}

👤 المطور:
➤ ${user}

╰━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply('❌ فشل تحميل المستودع')
  }
}

handler.help = ['git <link>']
handler.tags = ['tools']
handler.command = /^(git|جيت)$/i

export default handler