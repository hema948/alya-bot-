import fetch from 'node-fetch';
import * as Jimp from 'jimp';

const handler = async (m, { conn, command, usedPrefix, text }) => {
  const isSubBots = [conn.user.jid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].includes(m.sender);
  if (!isSubBots) return m.reply(`「✦」الأمر *${command}* مخصص فقط للبوت أو المالك.`);

  try {
    const value = text ? text.trim() : '';

    switch (command) {
      case 'صوره':
      case 'تعيين-صوره': {
        const q = m.quoted || m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image\/(png|jpe?g)/.test(mime)) {
          return conn.reply(m.chat, `✐ أرسل أو رد على صورة (PNG / JPG).`, m);
        }

        const media = await q.download();
        if (!media) return conn.reply(m.chat, `ꕥ فشل جلب الصورة.`, m);

        const image = await Jimp.read(media);
        const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
        await conn.updateProfilePicture(conn.user.jid, buffer);

        conn.reply(m.chat, `✔️ تم تغيير صورة البروفايل بنجاح.`, m);
        break;
      }

      case 'بايو':
      case 'حاله': {
        if (!text) return conn.reply(m.chat, `✐ اكتب البايو الجديد.`, m);
        await conn.updateProfileStatus(text);
        conn.reply(m.chat, `✔️ تم تحديث البايو:\n> "${text}"`, m);
        break;
      }

      case 'اسم':
      case 'يوزر': {
        if (!value) return conn.reply(m.chat, `✐ اكتب الاسم الجديد.`, m);
        if (value.length < 3 || value.length > 25) {
          return conn.reply(m.chat, `ꕥ الاسم لازم يكون بين 3 و 25 حرف.`, m);
        }
        await conn.updateProfileName(value);
        m.reply(`✔️ تم تغيير الاسم:\n> ${value}`);
        break;
      }
    }
  } catch (error) {
    m.reply(`⚠️ صار خطأ.\n> استخدم ${usedPrefix}report لو استمر.\n\n${error.message}`);
  }
};

handler.help = ['صوره', 'بايو', 'اسم'];
handler.tags = ['سيربوت'];
handler.command = [
  'صوره', 'تعيين-صوره',
  'بايو', 'حاله',
  'اسم', 'يوزر'
];

export default handler;