let handler = async (m, { conn }) => {

let users = Object.entries(global.db.data.users)

// فقط المستخدمين الذين لديهم نقاط
let filtered = users.filter(v => (v[1].exp || 0) > 0)

// ترتيب حسب النقاط
let sorted = filtered.sort((a, b) => (b[1].exp || 0) - (a[1].exp || 0))

// أفضل 40
let top = sorted.slice(0, 40)

let text = `🏆 *أفضل 40 مستخدم استخدموا البوت*\n\n`

for (let i = 0; i < top.length; i++) {

let id = top[i][0]
let data = top[i][1]

let name = await conn.getName(id)
let exp = data.exp || 0
let level = data.level || 0

text += `*${i + 1}.* ${name}\n`
text += `⭐ المستوى: ${level}\n`
text += `✨ النقاط: ${exp}\n\n`

}

conn.sendMessage(m.chat,{text},{quoted:m})

}

handler.help = ['top40']
handler.tags = ['xp']
handler.command = ['top','top40','افضل']

export default handler