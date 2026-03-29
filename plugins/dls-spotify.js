let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return m.reply(
        "🎵 *أمر تشغيل Spotify*\n\n" +
        "يجب عليك تقديم اسم الأغنية.\n\n" +
        "📌 مثال:\n" +
        ".اغنية Golden brown\n\n" +
        "يقوم هذا الأمر بالبحث في Spotify، وتنزيل الأغنية، وإرسال الصوت إليك."
      );
    }

    if (text.length > 100) {
      return m.reply("❌ عنوان الأغنية طويل جدًا. يُرجى ألا يتجاوز 100 حرف..");
    }

    await conn.sendMessage(m.chat, {
      react: { text: '⌛', key: m.key }
    });

    const res = await fetch(
      `https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(text)}`
    );
    const json = await res.json();

    if (!json.status || !json.result?.download) {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return m.reply(`❌ لم يتم العثور على نتائج لـ: *${text}*`);
    }

    const song = json.result;
    const title = song.title || "Unknown Song";
    const artist = song.artists || "Unknown Artist";
    const audioUrl = song.download;

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

    // Send audio (playable)
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: title.substring(0, 30),
            body: artist.substring(0, 30),
            thumbnailUrl: song.image || "",
            sourceUrl: song.external_url || "",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    );

    // Send as document (downloadable)
    await conn.sendMessage(
      m.chat,
      {
        document: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${title.replace(/[<>:"/\\|?*]/g, "_")}.mp3`,
        caption: `🎵 *${title}*\n👤 ${artist}\n\nتم التنزيل عبر سبوتيفاي`
      },
      { quoted: m }
    );

  } catch (e) {
    console.error("Spotify Play Error:", e);
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    m.reply(`❌ فشل تنزيل الأغنية.\n\nError: ${e.message}`);
  }
};

handler.help = ["سبوتيفاي <نص البحث>"];

handler.command = ['سبوتيفاي','spotify','spdl'];
handler.tags = ['download'];
handler.register = true


export default handler;