import axios from 'axios';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

const handler = async (m, { conn, text, usedPrefix, command }) => {

  // ✅ لو مفيش اختيار → يجيب القائمة
  if (!text) {
    return m.reply(
      'اختر موقع الرفع:\n\n' +
      '1 - Gofile\n' +
      '2 - File.io\n' +
      '3 - Imgbb (صور)\n' +
      '4 - Quax\n' +
      '5 - Ezgif (صور)\n' +
      '6 - Uguu\n' +
      '7 - Catbox\n\n' +
      `مثال: ${usedPrefix + command} 7`
    );
  }

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime) {
    return m.reply(`❗ استخدم الأمر بالرد على ملف\nمثال:\n${usedPrefix + command} 7`);
  }

  const media = await q.download();
  const { ext, mime: fullMime } = await fileTypeFromBuffer(media);
  const fileType = fullMime.split('/')[0];

  let link;

  switch (text) {
    case '1': link = await uploadToGofile(media, ext); break;
    case '2': link = await uploadToFileio(media, ext); break;
    case '3':
      if (fileType !== 'image') return m.reply('❗ هذا الخيار للصور فقط');
      link = await uploadToImgbb(media);
      break;
    case '4': link = await uploadToQuax(media, ext); break;
    case '5':
      if (fileType !== 'image') return m.reply('❗ هذا الخيار للصور فقط');
      link = await uploadToEzgif(media);
      break;
    case '6': link = await uploadToUguu(media, ext); break;
    case '7': link = await uploadToCatbox(media, ext); break;
    default:
      return m.reply('❗ اختر رقم صحيح');
  }

  const caption =
`📄 الاسم: ${q.filename || `file.${ext}`}
📦 النوع: ${fileType}
🧩 الصيغة: ${ext}

🔗 الرابط:
${link}`;

  const buttons = [{
    name: 'cta_copy',
    buttonParamsJson: JSON.stringify({
      display_text: 'نسخ الرابط',
      copy_code: link
    })
  }];

  await conn.sendMessage(m.chat, {
    text: caption,
    interactiveButtons: buttons
  }, { quoted: m });
};

handler.help = ['لرابط <رقم>'];
handler.tags = ['tools'];
handler.command = ['لرابط'];

export default handler;

/* ====== UPLOAD FUNCTIONS ====== */

const uploadToGofile = async (buffer, ext) => {
  const form = new FormData();
  form.append('file', buffer, `file.${ext}`);
  const res = await fetch('https://store2.gofile.io/uploadFile', { method: 'POST', body: form });
  const json = await res.json();
  return json.data.downloadPage;
};

const uploadToFileio = async (buffer, ext) => {
  const form = new FormData();
  form.append('file', buffer, `file.${ext}`);
  const res = await fetch('https://file.io', { method: 'POST', body: form });
  const json = await res.json();
  return json.link;
};

const uploadToImgbb = async (buffer) => {
  const form = new FormData();
  form.append('image', buffer);
  const res = await axios.post(
    'https://api.imgbb.com/1/upload?key=10604ee79e478b08aba6de5005e6c798',
    form,
    { headers: form.getHeaders() }
  );
  return res.data.data.url;
};

const uploadToQuax = async (buffer, ext) => {
  const form = new FormData();
  form.append('files[]', buffer, `file.${ext}`);
  const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form });
  const json = await res.json();
  return json.files[0].url;
};

const uploadToEzgif = async (buffer) => {
  const res = await axios.post('https://zoro-foryou.vercel.app/api/img-to-url', {
    image: buffer.toString('base64')
  });
  return res.data.imageUrl;
};

const uploadToUguu = async (buffer, ext) => {
  const form = new FormData();
  form.append('files[]', buffer, `file.${ext}`);
  const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form });
  const json = await res.json();
  return json.files[0].url;
};

const uploadToCatbox = async (buffer, ext) => {
  const form = new FormData();
  form.append('fileToUpload', buffer, `file.${ext}`);
  form.append('reqtype', 'fileupload');
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
  return await res.text();
};