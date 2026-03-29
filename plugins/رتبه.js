let handler = async (m, { conn }) => {

let user = global.db.data.users[m.sender]

let name = await conn.getName(m.sender)
let level = user.level || 0
let exp = user.exp || 0
let role = user.role || 'مستخدم'

function clockString(ms) {
let h = Math.floor(ms / 3600000)
let m = Math.floor(ms % 3600000 / 60000)
let s = Math.floor(ms % 60000 / 1000)
return [h, m, s].map(v => v.toString().padStart(2,0)).join(':')
}

let uptime = clockString(process.uptime() * 1000)

let txt = `
╭━━〔 🏅 رتبة المستخدم 〕━━⬣

👤 الاسم : ${name}
📞 الرقم : ${m.sender.split('@')[0]}

⭐ المستوى : ${level}
✨ الخبرة : ${exp}
🎖️ الرتبة : ${role}

⏱️ تشغيل البوت : ${uptime}

╰━━━━━━━━━━━━⬣
`

conn.sendMessage(m.chat,{text:txt},{quoted:m})

}

handler.help = ['رتبه']
handler.tags = ['xp']
handler.command = ['رتبه','rank','level']

export default handler