import axios from 'axios'

let handler = async (m, { conn, text }) => {

if (!text) {
return m.reply(`🎬 اكتب كلمة البحث

مثال:
.ايديت ناروتو
.ايديت لوفي`)
}

try {

await m.reply("⌛ جاري البحث عن ايديت HD...")

const api = `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text + " edit")}`
const { data } = await axios.get(api)

const results = data?.data || data

if (!results || results.length === 0) {
return m.reply("❌ لم يتم العثور على نتائج")
}

// اختيار فيديو عشوائي
const video = results[Math.floor(Math.random() * results.length)]

// روابط الفيديو الممكنة
const videoUrl =
video.hdplay ||
video.nowm ||
video.play ||
video.wmplay ||
video.video

if (!videoUrl) {
return m.reply("❌ لم يتم العثور على فيديو صالح")
}

const caption =
`┏━━〔 🎬 TikTok Edit 〕━━⬣
┃ 🔎 البحث: ${text}
┃ 🎵 اغنية: TikTok Sound
┃ 📺 الجودة: HD
┃ 👤 الكاتب: ${video.author || video.nickname || 'غير معروف'}
┗━━━━━━━━━━━━⬣`

await conn.sendMessage(m.chat, {
video: { url: videoUrl },
mimetype: 'video/mp4',
caption: caption
}, { quoted: m })

} catch (e) {
console.log(e)
m.reply("❌ حدث خطأ أثناء البحث")
}

}

handler.command = ['ايديت']
handler.tags = ['search']
handler.help = ['ايديت <كلمة>']
handler.limit = false

export default handler