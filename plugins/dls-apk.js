let handler = async (m, { conn, usedPrefix, command, text }) => {
  conn.apk = conn.apk || {}

  if (!text) {
    return conn.sendMessage(m.chat, {
text: `⚠️ ادخل اسم التطبيق اللي عايز تبحث عنه\n\n📌 مثال:\n${usedPrefix + command} Facebook`
    }, { quoted: m })
  }

  // إذا كان النص رقمًا وله تسجيل سابق
  if (!isNaN(text) && m.sender in conn.apk) {
    const idx = parseInt(text) - 1
    let dt = conn.apk[m.sender]

    if (dt.download) return conn.sendMessage(m.chat, { text: "⏳ أنت دلوقتي بتنزل ملف، استنى شوية...", ...global.rcanal }, { quoted: m })
    if (!dt.data[idx]) return conn.sendMessage(m.chat, { text: "❌ الرقم غير صالح", ...global.rcanal }, { quoted: m })

    try {
      dt.download = true
      let data = await aptoide.download(dt.data[idx].id)

      await conn.sendMessage(m.chat, {
        image: { url: data.img },
        caption: `📱 *الاسم:* ${data.appname}\n👨‍💻 *المطور:* ${data.developer}`
      }, { quoted: m })

      let dl = await conn.getFile(data.link)
      await conn.sendMessage(m.chat, {
        document: dl.data,
        fileName: `${data.appname}.apk`,
        mimetype: dl.mime,
        ...global.rcanal
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      conn.sendMessage(m.chat, { text: "❌ حصل خطأ أثناء تحميل ملف الـ APK.", ...global.rcanal }, { quoted: m })
    } finally {
      dt.download = false
    }
    return
  }

  // تطبيقات البحث
  let results = await aptoide.search(text)
  if (!results.length) {
    return conn.sendMessage(m.chat, { text: "⚠️ لم يتم العثور على أي نتائج للبحث الخاص بك."}, { quoted: m })
  }

  conn.apk[m.sender] = {
    data: results,
    download: false,
    time: setTimeout(() => delete conn.apk[m.sender], 10 * 60 * 1000)
  }

  // عرض الأزرار التي تحتوي على أول 3 نتائج
  const top3 = results.slice(0, 3)
  const buttons = top3.map((v, i) => ({
    buttonId: `${usedPrefix + command} ${i + 1}`,
    buttonText: { displayText: `${i + 1}. ${v.name}` },
    type: 1
  }))

  await conn.sendMessage(m.chat, {
    text: `> 🦞 النتائج لـ: *${text}*\n\nاختار تطبيق لتحميل ملف الـ APK:`,
footer: `📦 عرض أفضل 3 من أصل ${results.length} نتائج`,
    buttons,
    headerType: 1,
    ...global.rcanal
  }, { quoted: m })
}

handler.help = ['تطبيق <نص البحث>']
handler.tags = ['download']
handler.command = ['apk','تطبيق','Aptoide','التطبيق']   // تم تصحيحها بحيث يتم تسجيلها بشكل صحيح
handler.register = true     // تأكد من تحميله في برنامج البوت الخاص بك

export default handler

// وحدة Aptoide
const aptoide = {
  search: async function (query) {
    let res = await global.fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=100`)
    res = await res.json()
    if (!res.datalist?.list?.length) return []

    return res.datalist.list.map((v) => ({
      name: v.name,
      size: v.size,
      version: v.file?.vername || "N/A",
      id: v.package,
      download: v.stats?.downloads || 0
    }))
  },

  download: async function (id) {
    let res = await global.fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`)
    res = await res.json()
    if (!res.datalist?.list?.length) throw new Error("App no encontrada")

    const app = res.datalist.list[0]
    return {
      img: app.icon,
      developer: app.store?.name || "Desconocido",
      appname: app.name,
      link: app.file?.path
    }
  }
    }