import fs from 'fs'

async function handler(m, { usedPrefix }) {

const user = m.sender.split('@')[0]

if (fs.existsSync(`./${jadi}/` + user + '/creds.json')) {

let token = Buffer.from(
  fs.readFileSync(`./${jadi}/` + user + '/creds.json'),
  'utf-8'
).toString('base64')    

await conn.reply(
  m.chat,
  `${emoji} التوكن يسمح لك بتسجيل الدخول في بوتات أخرى، ننصح بعدم مشاركته مع أي شخص.\n\n*🔑 التوكن الخاص بك:*`,
  m
)

await conn.reply(m.chat, token, m)

} else {

await conn.reply(
  m.chat,
  `${emoji2} لا يوجد لديك أي توكن مفعل، استخدم ${usedPrefix}jadibot لإنشاء واحد.`,
  m
)

}

}

handler.help = ['توكن']
handler.command = ['token', 'توكن']
handler.tags = ['سيربوت']
handler.private = true

export default handler