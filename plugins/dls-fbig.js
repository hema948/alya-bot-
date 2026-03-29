const handler = async (m, { args, conn, usedPrefix, command }) => {
  try {
  
    const mensajes = {
      instagram: '「✦」من فضلك أرسل رابط إنستجرام صحيح.',
ig: '「✦」من فضلك أرسل رابط إنستجرام صحيح.',
insta: '「✦」من فضلك أرسل رابط إنستجرام صحيح.',
انستا: '「✦」من فضلك أرسل رابط إنستجرام صحيح.',
      facebook: '「✦」من فضلك أرسل رابط فيسبوك صحيح.',
fb: '「✦」من فضلك أرسل رابط فيسبوك صحيح.',
فيس: '「✦」من فضلك أرسل رابط فيسبوك صحيح.',
    };

    if (!args[0]) return conn.reply(m.chat, mensajes[command] || '「✦」لو سمحت حط رابط صحيح عشان أقدر أحمله لك.', m);

    let data = [];
    await m.react('🕒');

    
    try {
      const api = `${global.APIs.vreden.url}/api/igdownload?url=${encodeURIComponent(args[0])}`;
      const res = await fetch(api);
      const json = await res.json();
      if (json.resultado?.respuesta?.datos?.length) {
        data = json.resultado.respuesta.datos.map(v => v.url);
      }
    } catch {}

  
    if (!data.length) {
      try {
        const api = `${global.APIs.delirius.url}/download/instagram?url=${encodeURIComponent(args[0])}`;
        const res = await fetch(api);
        const json = await res.json();
        if (json.status && json.data?.length) {
          data = json.data.map(v => v.url);
        }
      } catch {}
    }

    if (!data.length) return conn.reply(m.chat, `❌ حدث خطأ أثناء جلب محتوى الرابط، حاول مرة أخرى.`, m);

    for (let media of data) {
      await conn.sendFile(m.chat, media, 'video.mp4', `> ✦ تم تنفيذ طلبك بنجاح 🪄`, m);
      await m.react('✔️');
    }
  } catch (error) {
    await m.react('✖️');
 await m.reply(`❌ حدث خطأ غير متوقع.
استخدم *${usedPrefix}ابلاغ* للإبلاغ عنه.

التفاصيل: ${error.message}`);
  }
};

handler.command = ['instagram', 'ig', 'facebook', 'fb','انستا','فيس','insta'];
handler.tags = ['download'];
handler.help = ['فيس <رابط التحميل>', 'انستا <رابط التحميل>'];


export default handler;